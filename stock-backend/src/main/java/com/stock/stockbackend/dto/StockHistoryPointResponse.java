package com.stock.stockbackend.dto;

import java.math.BigDecimal;

public record StockHistoryPointResponse(
        String time,
        BigDecimal price
) {
}
