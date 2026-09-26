package com.stock.stockbackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "stock_history_cache",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_stock_history_symbol_range",
                        columnNames = {"stock_symbol", "time_range"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class StockHistoryCache extends BaseEntity {

    @NotBlank
    @Size(max = 20)
    @Column(name = "stock_symbol", nullable = false, length = 20)
    private String stockSymbol;

    @NotBlank
    @Size(max = 10)
    @Column(name = "time_range", nullable = false, length = 10)
    private String timeRange;

    @NotBlank
    @Column(name = "data_json", nullable = false, columnDefinition = "TEXT")
    private String dataJson;

    @NotNull
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
