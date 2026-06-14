package com.stock.stockbackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TwelveDataTimeSeriesResponse(
        String status,
        String code,
        String message,
        List<TwelveDataTimeSeriesValue> values
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TwelveDataTimeSeriesValue(
            String datetime,
            String close
    ) {
    }
}
