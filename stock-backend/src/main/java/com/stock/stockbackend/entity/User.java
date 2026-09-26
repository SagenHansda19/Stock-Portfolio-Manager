package com.stock.stockbackend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stock.stockbackend.enums.Role;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.persistence.Version;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.PostLoad;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
@Table(
        name = "app_users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_app_users_email", columnNames = "email")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {

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

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String fullName;

    @Email
    @NotBlank
    @Size(max = 150)
    @Column(nullable = false, length = 150)
    private String email;

    @JsonIgnore
    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @NotNull
    @Column(name = "cash_balance", nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal cashBalance = new BigDecimal("100000.00");

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Portfolio> portfolios = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PortfolioPosition> positions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TradeTransaction> transactions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WatchlistItem> watchlistItems = new ArrayList<>();
}
