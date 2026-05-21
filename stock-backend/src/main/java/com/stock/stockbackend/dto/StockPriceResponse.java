package com.stock.stockbackend.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record StockPriceResponse(
        String symbol,
        BigDecimal price,
        Instant lastUpdated
) {
}
