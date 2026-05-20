package com.stock.stockbackend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "portfolios",
        indexes = {
                @Index(name = "idx_portfolios_user_id", columnList = "user_id"),
                @Index(name = "idx_portfolios_stock_symbol", columnList = "stock_symbol")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_portfolios_user_stock_symbol",
                        columnNames = {"user_id", "stock_symbol"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    @Size(max = 500)
    @Column(length = 500)
    private String description;

    @NotBlank
    @Size(max = 20)
    @Column(name = "stock_symbol", nullable = false, length = 20)
    private String stockSymbol;

    @NotNull
    @DecimalMin(value = "0.0000")
    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal quantity = BigDecimal.ZERO;

    @NotNull
    @DecimalMin(value = "0.0000")
    @Column(name = "average_buy_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal averageBuyPrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_portfolios_user")
    )
    private User user;

    @OneToMany(mappedBy = "portfolio")
    private List<Transaction> transactions = new ArrayList<>();
}
