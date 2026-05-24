package com.stock.stockbackend.dto;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioValuationResponse(
        BigDecimal totalPortfolioValue,
        BigDecimal totalProfitLoss,
        int page,
        int size,
        long totalElements,
        int totalPages,
        List<PortfolioValuationHoldingResponse> holdings
) {
}
