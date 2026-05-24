package com.stock.stockbackend.repository;

import com.stock.stockbackend.entity.StockPrice;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockPriceRepository extends JpaRepository<StockPrice, Long> {

    Optional<StockPrice> findByStockSymbol(String stockSymbol);

    List<StockPrice> findByStockSymbolIn(Collection<String> stockSymbols);

    Optional<StockPrice> findTopByStockSymbolOrderByPriceTimestampDesc(String stockSymbol);
}
