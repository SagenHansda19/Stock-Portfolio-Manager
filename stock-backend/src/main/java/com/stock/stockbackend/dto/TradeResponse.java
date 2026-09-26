package com.stock.stockbackend.dto;

import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeResponse {

    private Long transactionId;
    private Long userId;
    private String ticker;
    private String action;
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalAmount;
    private BigDecimal remainingCashBalance;
    private Instant executedAt;
    private String message;
}
