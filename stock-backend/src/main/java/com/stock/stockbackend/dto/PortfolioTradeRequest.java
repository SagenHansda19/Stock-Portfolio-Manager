package com.stock.stockbackend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.math.BigDecimal;

public record PortfolioTradeRequest(
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9.-]{1,20}$", message = "Symbol must be 1-20 letters, numbers, dots, or hyphens")
        String symbol,

        @NotNull
        @DecimalMin(value = "0.0001", message = "Quantity must be greater than 0")
        BigDecimal quantity,

        @NotNull
        @DecimalMin(value = "0.0001", message = "Price must be greater than 0")
        BigDecimal price
) {
}
