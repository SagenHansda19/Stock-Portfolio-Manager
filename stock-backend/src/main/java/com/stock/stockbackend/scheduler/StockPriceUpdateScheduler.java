package com.stock.stockbackend.scheduler;

import com.stock.stockbackend.exception.InvalidStockSymbolException;
import com.stock.stockbackend.exception.StockApiException;
import com.stock.stockbackend.exception.StockApiRateLimitException;
import com.stock.stockbackend.exception.StockSymbolNotFoundException;
import com.stock.stockbackend.service.StockPriceService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class StockPriceUpdateScheduler {

    private final StockPriceService stockPriceService;

    @Scheduled(fixedDelayString = "${stock.price.update.fixed-delay-ms}")
    public void updateTrackedStockPrices() {
        log.info("Updating stock prices...");

        List<String> trackedSymbols = stockPriceService.getTrackedSymbols();
        if (trackedSymbols.isEmpty()) {
            log.info("No tracked stock symbols found. Skipping scheduled price update.");
            return;
        }

        for (String symbol : trackedSymbols) {
            updateSingleSymbol(symbol);
        }

        log.info("Finished scheduled stock price update for {} symbols", trackedSymbols.size());
    }

    private void updateSingleSymbol(String symbol) {
        try {
            stockPriceService.fetchAndSaveLatestPrice(symbol);
            log.info("Updated {} successfully", symbol);
        } catch (InvalidStockSymbolException | StockSymbolNotFoundException exception) {
            log.warn("Skipping invalid stock symbol={} reason={}", symbol, exception.getMessage());
        } catch (StockApiRateLimitException exception) {
            log.warn("Failed updating {} because API rate limit was reached: {}", symbol, exception.getMessage());
        } catch (StockApiException exception) {
            log.warn("Failed updating {} due to stock API error: {}", symbol, exception.getMessage());
        } catch (RuntimeException exception) {
            log.error("Failed updating {} due to unexpected error", symbol, exception);
        }
    }
}
