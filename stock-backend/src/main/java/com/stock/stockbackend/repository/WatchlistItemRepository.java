package com.stock.stockbackend.repository;

import com.stock.stockbackend.entity.WatchlistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, Long> {

    List<WatchlistItem> findByUserIdOrderByAddedAtDesc(Long userId);

    Optional<WatchlistItem> findByUserIdAndTicker(Long userId, String ticker);

    boolean existsByUserIdAndTicker(Long userId, String ticker);

    void deleteByUserIdAndTicker(Long userId, String ticker);
}
