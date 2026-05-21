package com.stock.stockbackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "stock_prices",
        indexes = {
                @Index(name = "idx_stock_prices_symbol", columnList = "stock_symbol")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_stock_prices_symbol",
                        columnNames = "stock_symbol"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StockPrice extends BaseEntity {

    @NotBlank
    @Size(max = 20)
    @Column(name = "stock_symbol", nullable = false, length = 20)
    private String stockSymbol;

    @NotNull
    @DecimalMin(value = "0.0001")
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal price;

    @NotNull
    @PastOrPresent
    @Column(name = "price_timestamp", nullable = false)
    private Instant priceTimestamp;
}
