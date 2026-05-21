package com.stock.stockbackend.service;

import com.stock.stockbackend.dto.FinnhubQuoteResponse;
import com.stock.stockbackend.exception.StockApiException;
import com.stock.stockbackend.exception.StockApiRateLimitException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
@RequiredArgsConstructor
@Slf4j
public class StockApiService {

    private final RestClient finnhubRestClient;

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
}
