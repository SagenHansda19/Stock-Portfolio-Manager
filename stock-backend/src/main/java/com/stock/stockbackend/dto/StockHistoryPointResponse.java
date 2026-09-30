package com.stock.stockbackend.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.math.BigDecimal;

public record StockHistoryPointResponse(
        @JsonProperty("time") String time,
        @JsonProperty("price") BigDecimal price
) implements Serializable {

    private static final long serialVersionUID = 1L;

    @JsonCreator
    public StockHistoryPointResponse(
            @JsonProperty("time") String time,
            @JsonProperty("price") BigDecimal price
    ) {
        this.time = time;
        this.price = price;
    }
}
