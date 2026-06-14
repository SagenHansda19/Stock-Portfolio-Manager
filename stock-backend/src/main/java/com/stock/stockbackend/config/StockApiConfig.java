package com.stock.stockbackend.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class StockApiConfig {

    @Bean
    public RestClient finnhubRestClient(
            @Value("${stock.api.finnhub.base-url}") String baseUrl,
            @Value("${stock.api.finnhub.api-key}") String apiKey,
            @Value("${stock.api.connect-timeout-seconds}") long connectTimeoutSeconds,
            @Value("${stock.api.read-timeout-seconds}") long readTimeoutSeconds
    ) {
        return RestClient.builder()
                .requestFactory(buildRequestFactory(connectTimeoutSeconds, readTimeoutSeconds))
                .baseUrl(baseUrl)
                .defaultHeader("X-Finnhub-Token", apiKey)
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }

    @Bean
    public RestClient twelveDataRestClient(
            @Value("${stock.api.twelvedata.base-url}") String baseUrl,
            @Value("${stock.api.connect-timeout-seconds}") long connectTimeoutSeconds,
            @Value("${stock.api.read-timeout-seconds}") long readTimeoutSeconds
    ) {
        return RestClient.builder()
                .requestFactory(buildRequestFactory(connectTimeoutSeconds, readTimeoutSeconds))
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }

    private SimpleClientHttpRequestFactory buildRequestFactory(long connectTimeoutSeconds, long readTimeoutSeconds) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(connectTimeoutSeconds));
        requestFactory.setReadTimeout(Duration.ofSeconds(readTimeoutSeconds));
        return requestFactory;
    }
}
