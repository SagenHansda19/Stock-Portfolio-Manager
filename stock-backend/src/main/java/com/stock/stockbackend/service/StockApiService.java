package com.stock.stockbackend.service;

import com.stock.stockbackend.dto.FinnhubQuoteResponse;
import com.stock.stockbackend.dto.StockSearchResponse;
import com.stock.stockbackend.dto.TwelveDataTimeSeriesResponse;
import com.stock.stockbackend.enums.HistoricalRange;
import com.stock.stockbackend.exception.StockApiException;
import com.stock.stockbackend.exception.StockApiRateLimitException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockApiService {

    private final RestClient finnhubRestClient;
    private final RestClient twelveDataRestClient;

    @Value("${stock.api.twelvedata.api-key}")
    private String twelveDataApiKey;

    public FinnhubQuoteResponse fetchQuote(String symbol) {
        try {
            log.info("Fetching stock quote from Finnhub for symbol={}", symbol);

            return finnhubRestClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/quote")
                            .queryParam("symbol", symbol)
                            .build()
                    )
                    .retrieve()
                    .onStatus(status -> status.value() == 429, (request, response) -> {
                        log.warn("Finnhub rate limit reached while fetching symbol={}", symbol);
                        throw new StockApiRateLimitException("Stock API rate limit exceeded. Please try again later.");
                    })
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        log.warn(
                                "Finnhub returned status={} while fetching symbol={}",
                                response.getStatusCode(),
                                symbol
                        );
                        throw new StockApiException("Unable to fetch stock price from external API");
                    })
                    .body(FinnhubQuoteResponse.class);
        } catch (StockApiException | StockApiRateLimitException exception) {
            throw exception;
        } catch (RestClientException exception) {
            log.error("Finnhub request failed for symbol={}", symbol, exception);
            throw new StockApiException("Stock API is currently unavailable", exception);
        }
    }

    @Cacheable(
            value = "stockHistoryRaw",
            key = "(#symbol != null ? #symbol.trim().toUpperCase() : '') + '_' + (#range != null ? #range.value : '1D')",
            unless = "#result == null || #result.values() == null || #result.values().isEmpty()"
    )
    public TwelveDataTimeSeriesResponse fetchTimeSeries(String symbol, HistoricalRange range) {
        try {
            log.info(
                    "Fetching historical time series from Twelve Data for symbol={} range={}",
                    symbol,
                    range.getValue()
            );

            TwelveDataTimeSeriesResponse response = twelveDataRestClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/time_series")
                            .queryParam("symbol", symbol)
                            .queryParam("interval", range.getInterval())
                            .queryParam("outputsize", range.getOutputSize())
                            .queryParam("order", "asc")
                            .queryParam("apikey", twelveDataApiKey)
                            .build()
                    )
                    .retrieve()
                    .onStatus(status -> status.value() == 429, (request, clientResponse) -> {
                        log.warn("Twelve Data rate limit reached while fetching symbol={}", symbol);
                        throw new StockApiRateLimitException("Stock API rate limit exceeded. Please try again later.");
                    })
                    .onStatus(HttpStatusCode::isError, (request, clientResponse) -> {
                        log.warn(
                                "Twelve Data returned status={} while fetching symbol={} range={}",
                                clientResponse.getStatusCode(),
                                symbol,
                                range.getValue()
                        );
                        throw new StockApiException("Unable to fetch stock history from external API");
                    })
                    .body(TwelveDataTimeSeriesResponse.class);

            if (response == null) {
                throw new StockApiException("Stock history response is empty");
            }

            if (response.status() == null || !"ok".equalsIgnoreCase(response.status())) {
                String message = response.message() != null
                        ? response.message()
                        : "Unable to fetch stock history from external API";
                throw new StockApiException(message);
            }

            return response;
        } catch (StockApiException | StockApiRateLimitException exception) {
            throw exception;
        } catch (RestClientException exception) {
            log.error("Twelve Data request failed for symbol={} range={}", symbol, range.getValue(), exception);
            throw new StockApiException("Stock API is currently unavailable", exception);
        }
    }

    public StockSearchResponse searchSymbols(String query) {
        try {
            log.info("Searching stock symbols from Finnhub for query={}", query);

            return finnhubRestClient
                    .get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", query)
                            .build()
                    )
                    .retrieve()
                    .onStatus(status -> status.value() == 429, (request, response) -> {
                        log.warn("Finnhub rate limit reached while searching query={}", query);
                        throw new StockApiRateLimitException("Stock API rate limit exceeded. Please try again later.");
                    })
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        log.warn(
                                "Finnhub returned status={} while searching query={}",
                                response.getStatusCode(),
                                query
                        );
                        throw new StockApiException("Unable to search stocks from external API");
                    })
                    .body(StockSearchResponse.class);
        } catch (StockApiException | StockApiRateLimitException exception) {
            throw exception;
        } catch (RestClientException exception) {
            log.error("Finnhub search request failed for query={}", query, exception);
            throw new StockApiException("Stock API is currently unavailable", exception);
        }
    }
}
