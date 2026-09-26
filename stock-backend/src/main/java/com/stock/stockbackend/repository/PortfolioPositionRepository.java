package com.stock.stockbackend.repository;

import com.stock.stockbackend.entity.PortfolioPosition;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioPositionRepository extends JpaRepository<PortfolioPosition, Long> {

    List<PortfolioPosition> findByUserId(Long userId);

    Page<PortfolioPosition> findByUserId(Long userId, Pageable pageable);

    Optional<PortfolioPosition> findByUserIdAndTicker(Long userId, String ticker);

    boolean existsByUserIdAndTicker(Long userId, String ticker);

    void deleteByUserIdAndTicker(Long userId, String ticker);
}
