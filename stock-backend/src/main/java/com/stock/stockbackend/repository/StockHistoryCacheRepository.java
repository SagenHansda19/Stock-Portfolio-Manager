package com.stock.stockbackend.repository;

import com.stock.stockbackend.entity.StockHistoryCache;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StockHistoryCacheRepository extends JpaRepository<StockHistoryCache, Long> {

    Optional<StockHistoryCache> findByStockSymbolAndTimeRange(String stockSymbol, String timeRange);
}
