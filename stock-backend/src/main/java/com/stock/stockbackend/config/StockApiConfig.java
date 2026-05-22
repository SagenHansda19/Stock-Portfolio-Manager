package com.stock.stockbackend.config;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.HttpHeaders;
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
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(connectTimeoutSeconds));
        requestFactory.setReadTimeout(Duration.ofSeconds(readTimeoutSeconds));

        return RestClient.builder()
                .requestFactory(requestFactory)
                .baseUrl(baseUrl)
                .defaultHeader("X-Finnhub-Token", apiKey)
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }
}
