package com.stock.stockbackend.dto;

import java.math.BigDecimal;

public record PortfolioValuationHoldingResponse(
        String symbol,
        BigDecimal quantity,
        BigDecimal averageBuyPrice,
        BigDecimal currentPrice,
        BigDecimal holdingValue,
        BigDecimal profitLoss
) {
}
