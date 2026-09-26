package com.stock.stockbackend.service;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.stock.stockbackend.dto.MarketNewsDto;
import com.stock.stockbackend.dto.StockScreenerCriteriaDto;
import com.stock.stockbackend.dto.StockScreenerResultDto;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MarketDataServiceTest {

    private MarketDataService marketDataService;

    @BeforeEach
    void setUp() {
        marketDataService = new MarketDataService();
    }

    @Test
    void getMarketNews_ReturnsArticles() {
        List<MarketNewsDto> generalNews = marketDataService.getMarketNews("general");
        assertNotNull(generalNews);
        assertFalse(generalNews.isEmpty());

        List<MarketNewsDto> cryptoNews = marketDataService.getMarketNews("crypto");
        assertNotNull(cryptoNews);
        assertFalse(cryptoNews.isEmpty());
    }

    @Test
    void screenStocks_FiltersBySector() {
        StockScreenerCriteriaDto criteria = StockScreenerCriteriaDto.builder()
                .sector("Technology")
                .build();

        List<StockScreenerResultDto> results = marketDataService.screenStocks(criteria);
        assertNotNull(results);
        assertFalse(results.isEmpty());
        for (StockScreenerResultDto result : results) {
            assertTrue("Technology".equalsIgnoreCase(result.getSector()));
        }
    }

    @Test
    void screenStocks_FiltersByPriceRange() {
        StockScreenerCriteriaDto criteria = StockScreenerCriteriaDto.builder()
                .minPrice(new BigDecimal("100.00"))
                .maxPrice(new BigDecimal("200.00"))
                .build();

        List<StockScreenerResultDto> results = marketDataService.screenStocks(criteria);
        assertNotNull(results);
        for (StockScreenerResultDto result : results) {
            assertTrue(result.getPrice().compareTo(new BigDecimal("100.00")) >= 0);
            assertTrue(result.getPrice().compareTo(new BigDecimal("200.00")) <= 0);
        }
    }
}
