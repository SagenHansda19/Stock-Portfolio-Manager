package com.stock.stockbackend.dto;

import java.math.BigDecimal;

public record PortfolioHoldingResponse(
        Long id,
        String symbol,
        BigDecimal quantity,
        BigDecimal averageBuyPrice,
        BigDecimal totalInvested,
        BigDecimal currentPrice,
        BigDecimal currentValue,
        BigDecimal gainLoss
) {
}
