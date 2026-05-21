package com.stock.stockbackend.dto;

import java.math.BigDecimal;

public record FinnhubQuoteResponse(
        BigDecimal c,
        BigDecimal h,
        BigDecimal l,
        BigDecimal o,
        BigDecimal pc,
        Long t
) {
}
