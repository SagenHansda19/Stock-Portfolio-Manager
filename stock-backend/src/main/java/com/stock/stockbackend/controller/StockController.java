package com.stock.stockbackend.controller;

import com.stock.stockbackend.dto.StockPriceResponse;
import com.stock.stockbackend.service.StockPriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockPriceService stockPriceService;

    @GetMapping("/{symbol}")
    public ResponseEntity<StockPriceResponse> getStockPrice(@PathVariable String symbol) {
        return ResponseEntity.ok(stockPriceService.fetchAndSaveLatestPrice(symbol));
    }
}
