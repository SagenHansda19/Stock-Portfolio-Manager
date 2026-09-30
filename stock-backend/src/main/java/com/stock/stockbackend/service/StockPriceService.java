package com.stock.stockbackend.service;

import com.stock.stockbackend.dto.FinnhubQuoteResponse;
import com.stock.stockbackend.dto.StockHistoryPointResponse;
import com.stock.stockbackend.dto.StockPriceResponse;
import com.stock.stockbackend.dto.StockSearchResponse;
import com.stock.stockbackend.dto.TwelveDataTimeSeriesResponse;
import com.stock.stockbackend.entity.StockPrice;
import com.stock.stockbackend.enums.HistoricalRange;
import com.stock.stockbackend.exception.InvalidStockSymbolException;
import com.stock.stockbackend.exception.StockSymbolNotFoundException;
import com.stock.stockbackend.repository.StockPriceRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockPriceService {

    private static final Pattern SYMBOL_PATTERN = Pattern.compile("^[A-Z0-9.-]{1,20}$");
    private static final int PRICE_SCALE = 4;
    private static final DateTimeFormatter INTRADAY_LABEL_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final DateTimeFormatter WEEKLY_INTRADAY_LABEL_FORMATTER = DateTimeFormatter.ofPattern("EEE HH:mm");
    private static final DateTimeFormatter ONE_MONTH_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM d");
    private static final DateTimeFormatter WEEKLY_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM d");
    private static final DateTimeFormatter MONTHLY_LABEL_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");

    private final StockApiService stockApiService;
    private final StockPriceRepository stockPriceRepository;

    @Transactional
    public StockPriceResponse fetchAndSaveLatestPrice(String rawSymbol) {
        String symbol = normalizeSymbol(rawSymbol);
        FinnhubQuoteResponse quote = stockApiService.fetchQuote(symbol);

        validateQuote(symbol, quote);

        StockPrice stockPrice = stockPriceRepository.findByStockSymbol(symbol)
                .orElseGet(StockPrice::new);

        stockPrice.setStockSymbol(symbol);
        stockPrice.setPrice(scale(quote.c()));
        stockPrice.setPriceTimestamp(Instant.ofEpochSecond(quote.t()));

        StockPrice savedStockPrice = stockPriceRepository.save(stockPrice);
        log.info("Saved latest stock price for symbol={} price={}", symbol, savedStockPrice.getPrice());

        return toResponse(savedStockPrice);
    }

    @Transactional(readOnly = true)
    public List<String> getTrackedSymbols() {
        return stockPriceRepository.findAll()
                .stream()
                .map(StockPrice::getStockSymbol)
                .filter(symbol -> symbol != null && !symbol.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    @Cacheable(
            value = "stockHistory",
            key = "(#symbol != null ? #symbol.trim().toUpperCase() : '') + '_' + (#interval != null && !#interval.trim().isEmpty() ? #interval.trim().toUpperCase() : '1D')",
            unless = "#result == null || #result.isEmpty()"
    )
    public List<StockHistoryPointResponse> getHistoricalPrices(String symbol, String interval) {
        String normalizedSymbol = normalizeSymbol(symbol);
        HistoricalRange range = HistoricalRange.fromValue(interval);

        log.info("Cache miss for stock history symbol={} interval={}. Fetching from external API.", normalizedSymbol, range.getValue());
        TwelveDataTimeSeriesResponse response = stockApiService.fetchTimeSeries(normalizedSymbol, range);
        return mapHistoryPoints(normalizedSymbol, range, response);
    }

    private void validateQuote(String symbol, FinnhubQuoteResponse quote) {
        if (quote == null || quote.c() == null || quote.t() == null) {
            throw new StockSymbolNotFoundException(symbol);
        }

        if (quote.c().compareTo(BigDecimal.ZERO) <= 0 || quote.t() <= 0) {
            throw new StockSymbolNotFoundException(symbol);
        }
    }

    private String normalizeSymbol(String rawSymbol) {
        if (rawSymbol == null || rawSymbol.isBlank()) {
            throw new InvalidStockSymbolException(rawSymbol);
        }

        String symbol = rawSymbol.trim().toUpperCase(Locale.ROOT);
        if (!SYMBOL_PATTERN.matcher(symbol).matches()) {
            throw new InvalidStockSymbolException(rawSymbol);
        }

        return symbol;
    }

    private StockPriceResponse toResponse(StockPrice stockPrice) {
        return new StockPriceResponse(
                stockPrice.getStockSymbol(),
                stockPrice.getPrice(),
                stockPrice.getPriceTimestamp()
        );
    }

    private BigDecimal scale(BigDecimal value) {
        return value.setScale(PRICE_SCALE, RoundingMode.HALF_UP);
    }

    private List<StockHistoryPointResponse> mapHistoryPoints(
            String symbol,
            HistoricalRange range,
            TwelveDataTimeSeriesResponse response
    ) {
        if (response.values() == null || response.values().isEmpty()) {
            throw new StockSymbolNotFoundException(symbol);
        }

        List<StockHistoryPointResponse> points = new ArrayList<>();
        for (TwelveDataTimeSeriesResponse.TwelveDataTimeSeriesValue value : response.values()) {
            if (value == null || value.datetime() == null || value.close() == null) {
                continue;
            }

            BigDecimal parsedPrice;
            try {
                parsedPrice = scale(new BigDecimal(value.close()));
            } catch (NumberFormatException exception) {
                continue;
            }

            String label = formatHistoryLabel(value.datetime(), range);
            points.add(new StockHistoryPointResponse(label, parsedPrice));
        }

        if (points.isEmpty()) {
            throw new StockSymbolNotFoundException(symbol);
        }

        return points;
    }

    private String formatHistoryLabel(String rawDatetime, HistoricalRange range) {
        try {
            if (range == HistoricalRange.ONE_DAY) {
                LocalDateTime dateTime = LocalDateTime.parse(
                        rawDatetime,
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                );
                return dateTime.format(INTRADAY_LABEL_FORMATTER);
            }

            if (range == HistoricalRange.ONE_WEEK) {
                LocalDateTime dateTime = LocalDateTime.parse(
                        rawDatetime,
                        DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                );
                return dateTime.format(WEEKLY_INTRADAY_LABEL_FORMATTER);
            }

            if (range == HistoricalRange.ONE_MONTH) {
                LocalDate date = LocalDate.parse(rawDatetime, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
                return date.format(ONE_MONTH_LABEL_FORMATTER);
            }

            LocalDate date = LocalDate.parse(rawDatetime, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            if (range == HistoricalRange.ONE_YEAR) {
                return date.format(WEEKLY_LABEL_FORMATTER);
            }

            return date.format(MONTHLY_LABEL_FORMATTER);
        } catch (DateTimeParseException exception) {
            return rawDatetime;
        }
    }

    public StockSearchResponse searchSymbols(String query) {
        if (query == null || query.isBlank()) {
            return new StockSearchResponse(0, List.of());
        }
        return stockApiService.searchSymbols(query.trim());
    }
}
