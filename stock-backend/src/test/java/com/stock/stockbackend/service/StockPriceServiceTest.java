package com.stock.stockbackend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.stock.stockbackend.dto.StockHistoryPointResponse;
import com.stock.stockbackend.dto.TwelveDataTimeSeriesResponse;
import com.stock.stockbackend.entity.StockHistoryCache;
import com.stock.stockbackend.enums.HistoricalRange;
import com.stock.stockbackend.exception.InvalidStockSymbolException;
import com.stock.stockbackend.repository.StockHistoryCacheRepository;
import com.stock.stockbackend.repository.StockPriceRepository;
import java.lang.reflect.Method;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.annotation.Cacheable;

@ExtendWith(MockitoExtension.class)
class StockPriceServiceTest {

    @Mock
    private StockApiService stockApiService;

    @Mock
    private StockPriceRepository stockPriceRepository;

    @Mock
    private StockHistoryCacheRepository stockHistoryCacheRepository;

    @InjectMocks
    private StockPriceService stockPriceService;

    @Test
    void getHistoricalPrices_HasCacheableAnnotationWithCompositeKey() throws NoSuchMethodException {
        Method method = StockPriceService.class.getMethod("getHistoricalPrices", String.class, String.class);
        Cacheable cacheable = method.getAnnotation(Cacheable.class);

        assertNotNull(cacheable, "getHistoricalPrices must have @Cacheable annotation");
        assertEquals("stockHistory", cacheable.value()[0]);
        assertTrue(cacheable.key().contains("#symbol"), "Key must reference #symbol");
        assertTrue(cacheable.key().contains("#interval"), "Key must reference #interval");
    }

    @Test
    void stockApiService_FetchTimeSeries_HasCacheableAnnotation() throws NoSuchMethodException {
        Method method = StockApiService.class.getMethod("fetchTimeSeries", String.class, HistoricalRange.class);
        Cacheable cacheable = method.getAnnotation(Cacheable.class);

        assertNotNull(cacheable, "fetchTimeSeries must have @Cacheable annotation");
        assertEquals("stockHistoryRaw", cacheable.value()[0]);
        assertTrue(cacheable.key().contains("#symbol"), "Key must reference #symbol");
        assertTrue(cacheable.key().contains("#range"), "Key must reference #range");
    }

    @Test
    void getHistoricalPrices_WhenDbCacheFresh_ReturnsCachedAndBypassesExternalApi() {
        String symbol = "AAPL";
        String interval = "1D";

        StockHistoryCache cache = new StockHistoryCache();
        cache.setStockSymbol(symbol);
        cache.setTimeRange("1D");
        cache.setUpdatedAt(Instant.now());
        cache.setDataJson("[{\"time\":\"10:00\",\"price\":182.5000},{\"time\":\"10:05\",\"price\":183.0000}]");

        when(stockHistoryCacheRepository.findByStockSymbolAndTimeRange(symbol, "1D"))
                .thenReturn(Optional.of(cache));

        List<StockHistoryPointResponse> points = stockPriceService.getHistoricalPrices(symbol, interval);

        assertNotNull(points);
        assertEquals(2, points.size());
        assertEquals("10:00", points.get(0).time());

        // External API must not be called when DB cache is fresh
        verify(stockApiService, never()).fetchTimeSeries(any(), any());
    }

    @Test
    void getHistoricalPrices_WhenDbCacheMiss_CallsExternalApiAndSaves() {
        String symbol = "MSFT";
        String interval = "1D";

        when(stockHistoryCacheRepository.findByStockSymbolAndTimeRange(symbol, "1D"))
                .thenReturn(Optional.empty());

        TwelveDataTimeSeriesResponse.TwelveDataTimeSeriesValue val1 =
                new TwelveDataTimeSeriesResponse.TwelveDataTimeSeriesValue("2026-09-28 10:00:00", "420.50");
        TwelveDataTimeSeriesResponse.TwelveDataTimeSeriesValue val2 =
                new TwelveDataTimeSeriesResponse.TwelveDataTimeSeriesValue("2026-09-28 10:05:00", "421.00");

        TwelveDataTimeSeriesResponse apiResponse =
                new TwelveDataTimeSeriesResponse("ok", null, null, List.of(val1, val2));

        when(stockApiService.fetchTimeSeries(eq(symbol), eq(HistoricalRange.ONE_DAY)))
                .thenReturn(apiResponse);

        List<StockHistoryPointResponse> points = stockPriceService.getHistoricalPrices(symbol, interval);

        assertNotNull(points);
        assertEquals(2, points.size());
        verify(stockApiService).fetchTimeSeries(eq(symbol), eq(HistoricalRange.ONE_DAY));
        verify(stockHistoryCacheRepository).save(any(StockHistoryCache.class));
    }

    @Test
    void getHistoricalPrices_WithInvalidSymbol_ThrowsInvalidStockSymbolException() {
        assertThrows(InvalidStockSymbolException.class, () ->
                stockPriceService.getHistoricalPrices("", "1D"));

        assertThrows(InvalidStockSymbolException.class, () ->
                stockPriceService.getHistoricalPrices("INVALID$$$", "1D"));
    }
}
