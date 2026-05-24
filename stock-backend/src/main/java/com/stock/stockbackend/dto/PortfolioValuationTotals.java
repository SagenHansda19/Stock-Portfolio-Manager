package com.stock.stockbackend.dto;

import java.math.BigDecimal;

public interface PortfolioValuationTotals {

    BigDecimal getTotalPortfolioValue();

    BigDecimal getTotalProfitLoss();
}
