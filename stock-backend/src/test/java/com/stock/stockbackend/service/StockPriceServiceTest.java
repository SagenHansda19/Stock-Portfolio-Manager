package com.stock.stockbackend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.stock.stockbackend.dto.StockHistoryPointResponse;
import com.stock.stockbackend.dto.TwelveDataTimeSeriesResponse;
import com.stock.stockbackend.enums.HistoricalRange;
import com.stock.stockbackend.exception.InvalidStockSymbolException;
import com.stock.stockbackend.repository.StockPriceRepository;
import java.lang.reflect.Method;
import java.util.List;
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
        assertEquals("stockHistory", cacheable.value()[0]);
        assertTrue(cacheable.key().contains("#symbol"), "Key must reference #symbol");
        assertTrue(cacheable.key().contains("#range"), "Key must reference #range");
    }

    @Test
    void getHistoricalPrices_FetchesFromStockApiServiceAndMapsPoints() {
        String symbol = "MSFT";
        String interval = "1D";

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
        assertEquals("10:00", points.get(0).time());
        assertEquals("10:05", points.get(1).time());
        verify(stockApiService).fetchTimeSeries(eq(symbol), eq(HistoricalRange.ONE_DAY));
    }

    @Test
    void getHistoricalPrices_NormalizesSymbolAndRange() {
        String symbol = "aapl";
        String interval = "1w";

        TwelveDataTimeSeriesResponse.TwelveDataTimeSeriesValue val =
                new TwelveDataTimeSeriesResponse.TwelveDataTimeSeriesValue("2026-09-28 10:00:00", "225.50");

        TwelveDataTimeSeriesResponse apiResponse =
                new TwelveDataTimeSeriesResponse("ok", null, null, List.of(val));

        when(stockApiService.fetchTimeSeries(eq("AAPL"), eq(HistoricalRange.ONE_WEEK)))
                .thenReturn(apiResponse);

        List<StockHistoryPointResponse> points = stockPriceService.getHistoricalPrices(symbol, interval);

        assertNotNull(points);
        assertEquals(1, points.size());
        verify(stockApiService).fetchTimeSeries(eq("AAPL"), eq(HistoricalRange.ONE_WEEK));
    }

    @Test
    void getHistoricalPrices_WithInvalidSymbol_ThrowsInvalidStockSymbolException() {
        assertThrows(InvalidStockSymbolException.class, () ->
                stockPriceService.getHistoricalPrices("", "1D"));

        assertThrows(InvalidStockSymbolException.class, () ->
                stockPriceService.getHistoricalPrices("INVALID$$$", "1D"));
    }
}
