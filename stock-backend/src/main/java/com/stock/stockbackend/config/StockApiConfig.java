package com.stock.stockbackend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;

@Configuration
public class StockApiConfig {

    @Bean
    public RestClient finnhubRestClient(
            @Value("${stock.api.finnhub.base-url}") String baseUrl,
            @Value("${stock.api.finnhub.api-key}") String apiKey
    ) {
        return RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("X-Finnhub-Token", apiKey)
                .defaultHeader(HttpHeaders.ACCEPT, "application/json")
                .build();
    }
}
