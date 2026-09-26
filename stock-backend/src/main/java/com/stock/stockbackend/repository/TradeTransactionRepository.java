package com.stock.stockbackend.repository;

import com.stock.stockbackend.entity.TradeTransaction;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TradeTransactionRepository extends JpaRepository<TradeTransaction, Long> {

    List<TradeTransaction> findByUserIdOrderByExecutedAtDesc(Long userId);

    Page<TradeTransaction> findByUserIdOrderByExecutedAtDesc(Long userId, Pageable pageable);

    Page<TradeTransaction> findByUserIdAndTickerOrderByExecutedAtDesc(Long userId, String ticker, Pageable pageable);
}
