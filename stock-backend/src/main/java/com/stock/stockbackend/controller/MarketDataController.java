package com.stock.stockbackend.controller;

import com.stock.stockbackend.dto.MarketNewsDto;
import com.stock.stockbackend.dto.StockScreenerCriteriaDto;
import com.stock.stockbackend.dto.StockScreenerResultDto;
import com.stock.stockbackend.service.MarketDataService;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketDataController {

    private final MarketDataService marketDataService;

    @GetMapping("/news")
    public ResponseEntity<List<MarketNewsDto>> getMarketNews(
            @RequestParam(defaultValue = "general", required = false) String category
    ) {
        return ResponseEntity.ok(marketDataService.getMarketNews(category));
    }

    @PostMapping("/screener")
    public ResponseEntity<List<StockScreenerResultDto>> screenStocks(
            @RequestBody(required = false) StockScreenerCriteriaDto criteria
    ) {
        return ResponseEntity.ok(marketDataService.screenStocks(criteria));
    }

    @GetMapping("/screener")
    public ResponseEntity<List<StockScreenerResultDto>> screenStocksGet(
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Long minVolume,
            @RequestParam(required = false) BigDecimal minChangePercent,
            @RequestParam(required = false) BigDecimal maxChangePercent,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String direction
    ) {
        StockScreenerCriteriaDto criteria = StockScreenerCriteriaDto.builder()
                .sector(sector)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .minVolume(minVolume)
                .minChangePercent(minChangePercent)
                .maxChangePercent(maxChangePercent)
                .sortBy(sortBy)
                .direction(direction)
                .build();
        return ResponseEntity.ok(marketDataService.screenStocks(criteria));
    }
}
