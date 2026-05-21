package com.stock.stockbackend.service;

import com.stock.stockbackend.dto.FinnhubQuoteResponse;
import com.stock.stockbackend.dto.StockPriceResponse;
import com.stock.stockbackend.entity.StockPrice;
import com.stock.stockbackend.exception.InvalidStockSymbolException;
import com.stock.stockbackend.exception.StockSymbolNotFoundException;
import com.stock.stockbackend.repository.StockPriceRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Locale;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockPriceService {

    private static final Pattern SYMBOL_PATTERN = Pattern.compile("^[A-Z0-9.-]{1,20}$");
    private static final int PRICE_SCALE = 4;

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
}
