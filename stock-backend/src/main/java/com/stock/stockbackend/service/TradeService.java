package com.stock.stockbackend.service;

import com.stock.stockbackend.dto.TradeResponse;
import com.stock.stockbackend.entity.PortfolioPosition;
import com.stock.stockbackend.entity.TradeTransaction;
import com.stock.stockbackend.entity.User;
import com.stock.stockbackend.enums.TransactionType;
import com.stock.stockbackend.exception.InsufficientCashBalanceException;
import com.stock.stockbackend.exception.InsufficientStockQuantityException;
import com.stock.stockbackend.exception.TradeConflictException;
import com.stock.stockbackend.repository.PortfolioPositionRepository;
import com.stock.stockbackend.repository.StockPriceRepository;
import com.stock.stockbackend.repository.TradeTransactionRepository;
import com.stock.stockbackend.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradeService {

    private final UserRepository userRepository;
    private final PortfolioPositionRepository positionRepository;
    private final TradeTransactionRepository transactionRepository;
    private final StockPriceRepository stockPriceRepository;

    // Baseline mock prices for prevalent stocks
    private static final Map<String, BigDecimal> MOCK_PRICES = Map.of(
            "AAPL", new BigDecimal("185.5000"),
            "MSFT", new BigDecimal("420.2500"),
            "NVDA", new BigDecimal("125.4000"),
            "TSLA", new BigDecimal("245.8000"),
            "GOOGL", new BigDecimal("175.6000"),
            "AMZN", new BigDecimal("190.2000"),
            "META", new BigDecimal("505.7500"),
            "NFLX", new BigDecimal("670.3000")
    );

    /**
     * Executes a stock trade (BUY or SELL) transactionally with optimistic locking protection.
     *
     * @param userId   User ID placing the trade
     * @param ticker   Stock ticker symbol (e.g., AAPL)
     * @param quantity Number of shares to trade
     * @param action   "BUY" or "SELL"
     * @return TradeResponse containing trade execution details
     */
    @Transactional
    @CacheEvict(value = "portfolioAnalysis", key = "#userId")
    public TradeResponse executeTrade(Long userId, String ticker, int quantity, String action) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }
        if (ticker == null || ticker.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticker cannot be blank");
        }
        if (action == null || (!action.equalsIgnoreCase("BUY") && !action.equalsIgnoreCase("SELL"))) {
            throw new IllegalArgumentException("Action must be either BUY or SELL");
        }

        String normalizedTicker = ticker.trim().toUpperCase();
        TransactionType transactionType = TransactionType.valueOf(action.trim().toUpperCase());

        // 1. Fetch User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        // 2. Verify / Mock live price
        BigDecimal currentPrice = getLiveOrMockPrice(normalizedTicker);
        BigDecimal totalAmount = currentPrice.multiply(BigDecimal.valueOf(quantity)).setScale(4, RoundingMode.HALF_UP);

        PortfolioPosition position;
        TradeTransaction transaction;

        if (transactionType == TransactionType.BUY) {
            // Check cash balance
            if (user.getCashBalance().compareTo(totalAmount) < 0) {
                throw new InsufficientCashBalanceException(
                        String.format("Insufficient cash balance for user %d. Required: %s, Available: %s",
                                userId, totalAmount, user.getCashBalance())
                );
            }

            // Deduct cash from user
            user.setCashBalance(user.getCashBalance().subtract(totalAmount));

            // Update or create PortfolioPosition
            Optional<PortfolioPosition> existingPositionOpt = positionRepository.findByUserIdAndTicker(userId, normalizedTicker);
            if (existingPositionOpt.isPresent()) {
                position = existingPositionOpt.get();
                BigDecimal existingQty = position.getQuantity();
                BigDecimal existingAvg = position.getAverageBuyPrice();

                BigDecimal newQty = existingQty.add(BigDecimal.valueOf(quantity));
                BigDecimal totalCost = existingQty.multiply(existingAvg)
                        .add(BigDecimal.valueOf(quantity).multiply(currentPrice));
                BigDecimal newAvgPrice = totalCost.divide(newQty, 4, RoundingMode.HALF_UP);

                position.setQuantity(newQty);
                position.setAverageBuyPrice(newAvgPrice);
            } else {
                position = PortfolioPosition.builder()
                        .user(user)
                        .ticker(normalizedTicker)
                        .quantity(BigDecimal.valueOf(quantity).setScale(4, RoundingMode.HALF_UP))
                        .averageBuyPrice(currentPrice)
                        .build();
            }
            position = positionRepository.save(position);

            // Record transaction
            transaction = TradeTransaction.builder()
                    .user(user)
                    .portfolioPosition(position)
                    .ticker(normalizedTicker)
                    .action(TransactionType.BUY)
                    .quantity(quantity)
                    .price(currentPrice)
                    .totalAmount(totalAmount)
                    .executedAt(Instant.now())
                    .build();
            transaction = transactionRepository.save(transaction);

        } else { // SELL
            position = positionRepository.findByUserIdAndTicker(userId, normalizedTicker)
                    .orElseThrow(() -> new InsufficientStockQuantityException(
                            String.format("User %d does not hold any shares of %s to sell", userId, normalizedTicker)
                    ));

            if (position.getQuantity().compareTo(BigDecimal.valueOf(quantity)) < 0) {
                throw new InsufficientStockQuantityException(
                        String.format("Insufficient shares of %s. Required: %d, Available: %s",
                                normalizedTicker, quantity, position.getQuantity())
                );
            }

            // Add cash to user
            user.setCashBalance(user.getCashBalance().add(totalAmount));

            // Reduce position quantity
            BigDecimal remainingQty = position.getQuantity().subtract(BigDecimal.valueOf(quantity));
            position.setQuantity(remainingQty);
            if (remainingQty.compareTo(BigDecimal.ZERO) == 0) {
                position.setAverageBuyPrice(BigDecimal.ZERO);
            }
            position = positionRepository.save(position);

            // Record transaction
            transaction = TradeTransaction.builder()
                    .user(user)
                    .portfolioPosition(position)
                    .ticker(normalizedTicker)
                    .action(TransactionType.SELL)
                    .quantity(quantity)
                    .price(currentPrice)
                    .totalAmount(totalAmount)
                    .executedAt(Instant.now())
                    .build();
            transaction = transactionRepository.save(transaction);
        }

        // Apply trade and save updated User (optimistic lock verified via version)
        try {
            userRepository.saveAndFlush(user);
        } catch (ObjectOptimisticLockingFailureException ex) {
            log.warn("Concurrent trade conflict detected for user {} when trading {}. Version mismatch: {}",
                    userId, normalizedTicker, ex.getMessage());
            throw new TradeConflictException(
                    "Concurrent trade conflict detected. Please retry your trade request.", ex
            );
        }

        return TradeResponse.builder()
                .transactionId(transaction.getId())
                .userId(user.getId())
                .ticker(normalizedTicker)
                .action(transactionType.name())
                .quantity(quantity)
                .price(currentPrice)
                .totalAmount(totalAmount)
                .remainingCashBalance(user.getCashBalance())
                .executedAt(transaction.getExecutedAt())
                .message(String.format("Successfully executed %s of %d %s @ $%s",
                        transactionType.name(), quantity, normalizedTicker, currentPrice))
                .build();
    }

    /**
     * Resolves live or mock price for a stock ticker.
     */
    public BigDecimal getLiveOrMockPrice(String ticker) {
        String cleanTicker = ticker.trim().toUpperCase();

        // 1. Check local mock map
        if (MOCK_PRICES.containsKey(cleanTicker)) {
            return MOCK_PRICES.get(cleanTicker);
        }

        // 2. Check cached database price if available
        return stockPriceRepository.findByStockSymbol(cleanTicker)
                .map(priceEntity -> priceEntity.getPrice().setScale(4, RoundingMode.HALF_UP))
                .orElseGet(() -> {
                    // Fallback deterministic mock price for any unknown ticker
                    int hash = Math.abs(cleanTicker.hashCode() % 300) + 50;
                    return BigDecimal.valueOf(hash).setScale(4, RoundingMode.HALF_UP);
                });
    }

    @Transactional(readOnly = true)
    public List<PortfolioPosition> getUserPositions(Long userId) {
        return positionRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<TradeTransaction> getUserTransactions(Long userId) {
        return transactionRepository.findByUserIdOrderByExecutedAtDesc(userId);
    }
}
