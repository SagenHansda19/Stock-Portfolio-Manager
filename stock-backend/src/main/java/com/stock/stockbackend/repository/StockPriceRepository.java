package com.stock.stockbackend.repository;

import com.stock.stockbackend.entity.StockPrice;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

    Optional<StockPrice> findTopByStockSymbolOrderByPriceTimestampDesc(String stockSymbol);
}
