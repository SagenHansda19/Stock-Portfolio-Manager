package com.stock.stockbackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record StockSearchResponse(
        int count,
        List<StockSearchResult> result
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StockSearchResult(
            String description,
            String displaySymbol,
            String symbol,
            String type
    ) {
    }
}
