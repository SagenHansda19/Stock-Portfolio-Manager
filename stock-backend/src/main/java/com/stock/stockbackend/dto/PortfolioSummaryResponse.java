package com.stock.stockbackend.dto;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioSummaryResponse(
        List<PortfolioHoldingResponse> holdings,
        BigDecimal totalInvested,
        BigDecimal totalCurrentValue,
        BigDecimal totalGainLoss
) {
}
