package com.stock.stockbackend.repository;

import com.stock.stockbackend.entity.Portfolio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    Optional<Portfolio> findByUserEmailAndStockSymbol(String email, String stockSymbol);

    Optional<Portfolio> findByIdAndUserEmailAndActiveTrue(Long id, String email);

    List<Portfolio> findAllByUserEmailAndActiveTrueOrderByStockSymbolAsc(String email);
}
