package com.stock.stockbackend.repository;

import com.stock.stockbackend.dto.PortfolioValuationTotals;
import com.stock.stockbackend.entity.Portfolio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    Optional<Portfolio> findByUserEmailAndStockSymbol(String email, String stockSymbol);

    Optional<Portfolio> findByIdAndUserEmailAndActiveTrue(Long id, String email);

    List<Portfolio> findAllByUserEmailAndActiveTrueOrderByStockSymbolAsc(String email);

    @Query(
            value = """
                    SELECT p
                    FROM Portfolio p
                    LEFT JOIN StockPrice sp ON sp.stockSymbol = p.stockSymbol
                    WHERE p.user.email = :email
                      AND p.active = true
                      AND (:symbol IS NULL OR p.stockSymbol = :symbol)
                    ORDER BY
                      CASE WHEN :sortBy = 'symbol' AND :sortDirection = 'asc' THEN p.stockSymbol END ASC,
                      CASE WHEN :sortBy = 'symbol' AND :sortDirection = 'desc' THEN p.stockSymbol END DESC,
                      CASE WHEN :sortBy = 'quantity' AND :sortDirection = 'asc' THEN p.quantity END ASC,
                      CASE WHEN :sortBy = 'quantity' AND :sortDirection = 'desc' THEN p.quantity END DESC,
                      CASE WHEN :sortBy = 'holdingValue' AND :sortDirection = 'asc'
                           THEN (p.quantity * COALESCE(sp.price, p.averageBuyPrice)) END ASC,
                      CASE WHEN :sortBy = 'holdingValue' AND :sortDirection = 'desc'
                           THEN (p.quantity * COALESCE(sp.price, p.averageBuyPrice)) END DESC,
                      CASE WHEN :sortBy = 'profitLoss' AND :sortDirection = 'asc'
                           THEN ((COALESCE(sp.price, p.averageBuyPrice) - p.averageBuyPrice) * p.quantity) END ASC,
                      CASE WHEN :sortBy = 'profitLoss' AND :sortDirection = 'desc'
                           THEN ((COALESCE(sp.price, p.averageBuyPrice) - p.averageBuyPrice) * p.quantity) END DESC,
                      p.stockSymbol ASC
                    """,
            countQuery = """
                    SELECT COUNT(p)
                    FROM Portfolio p
                    WHERE p.user.email = :email
                      AND p.active = true
                      AND (:symbol IS NULL OR p.stockSymbol = :symbol)
                    """
    )
    Page<Portfolio> findActiveHoldingsForValuation(
            @Param("email") String email,
            @Param("symbol") String symbol,
            @Param("sortBy") String sortBy,
            @Param("sortDirection") String sortDirection,
            Pageable pageable
    );

    @Query("""
            SELECT
              COALESCE(SUM(p.quantity * COALESCE(sp.price, p.averageBuyPrice)), 0) AS totalPortfolioValue,
              COALESCE(SUM((COALESCE(sp.price, p.averageBuyPrice) - p.averageBuyPrice) * p.quantity), 0) AS totalProfitLoss
            FROM Portfolio p
            LEFT JOIN StockPrice sp ON sp.stockSymbol = p.stockSymbol
            WHERE p.user.email = :email
              AND p.active = true
              AND (:symbol IS NULL OR p.stockSymbol = :symbol)
            """)
    PortfolioValuationTotals calculateValuationTotals(
            @Param("email") String email,
            @Param("symbol") String symbol
    );
}
