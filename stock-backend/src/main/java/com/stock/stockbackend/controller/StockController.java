package com.stock.stockbackend.controller;

import com.stock.stockbackend.dto.StockHistoryPointResponse;
import com.stock.stockbackend.dto.StockPriceResponse;
import com.stock.stockbackend.dto.StockSearchResponse;
import java.util.List;
import com.stock.stockbackend.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockPriceService stockPriceService;

    @GetMapping("/search")
    public ResponseEntity<StockSearchResponse> searchStocks(@RequestParam String q) {
        return ResponseEntity.ok(stockPriceService.searchSymbols(q));
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<StockPriceResponse> getStockPrice(@PathVariable String symbol) {
        return ResponseEntity.ok(stockPriceService.fetchAndSaveLatestPrice(symbol));
    }

    @GetMapping("/history/{symbol}")
    public ResponseEntity<List<StockHistoryPointResponse>> getStockHistory(
            @PathVariable String symbol,
            @RequestParam(name = "range", defaultValue = "1D") String range,
            @RequestParam(name = "interval", required = false) String interval
    ) {
        String effectiveInterval = (interval != null && !interval.isBlank()) ? interval : range;
        return ResponseEntity.ok(stockPriceService.getHistoricalPrices(symbol, effectiveInterval));
    }
}
