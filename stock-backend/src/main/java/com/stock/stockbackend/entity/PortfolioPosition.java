package com.stock.stockbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
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
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Version;

@Entity
@Table(
        name = "portfolio_positions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_positions_user_ticker", columnNames = {"user_id", "ticker"})
        },
        indexes = {
                @Index(name = "idx_positions_user_id", columnList = "user_id"),
                @Index(name = "idx_positions_ticker", columnList = "ticker")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioPosition extends BaseEntity {

    @Version
    @Column(name = "version")
    @Builder.Default
    private Long version = 0L;

    @PostLoad
    @PrePersist
    @PreUpdate
    private void ensureVersionNotNull() {
        if (this.version == null) {
            this.version = 0L;
        }
    }

    public Long getVersion() {
        return this.version != null ? this.version : 0L;
    }

    @JsonIgnore
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String ticker;

    @NotNull
    @DecimalMin("0.0000")
    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.0000")
    @Column(name = "average_buy_price", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal averageBuyPrice = BigDecimal.ZERO;

    @JsonIgnore
    @OneToMany(mappedBy = "portfolioPosition", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TradeTransaction> transactions = new ArrayList<>();
}
