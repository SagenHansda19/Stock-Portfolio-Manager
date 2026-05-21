package com.stock.stockbackend.service;

import com.stock.stockbackend.dto.PortfolioHoldingResponse;
import com.stock.stockbackend.dto.PortfolioSummaryResponse;
import com.stock.stockbackend.dto.PortfolioTradeRequest;
import com.stock.stockbackend.dto.StockPriceResponse;
import com.stock.stockbackend.entity.Portfolio;
import com.stock.stockbackend.entity.StockPrice;
import com.stock.stockbackend.entity.Transaction;
import com.stock.stockbackend.entity.User;
import com.stock.stockbackend.enums.TransactionType;
import com.stock.stockbackend.exception.InsufficientStockQuantityException;
import com.stock.stockbackend.exception.PortfolioHoldingNotFoundException;
import com.stock.stockbackend.repository.PortfolioRepository;
import com.stock.stockbackend.repository.StockPriceRepository;
import com.stock.stockbackend.repository.TransactionRepository;
import com.stock.stockbackend.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private static final int MONEY_SCALE = 4;

    private final PortfolioRepository portfolioRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final StockPriceRepository stockPriceRepository;
    private final StockPriceService stockPriceService;

    @Transactional
    public PortfolioHoldingResponse buyStock(String userEmail, PortfolioTradeRequest request) {
        String symbol = normalizeSymbol(request.symbol());
        BigDecimal marketPrice = fetchMarketPrice(symbol);
        User user = getUserByEmail(userEmail);

        Portfolio holding = portfolioRepository.findByUserEmailAndStockSymbol(userEmail, symbol)
                .orElseGet(() -> createHolding(user, symbol));

        BigDecimal newQuantity = holding.getQuantity().add(request.quantity());
        BigDecimal newAverageBuyPrice = calculateAverageBuyPrice(holding, request.quantity(), marketPrice);

        holding.setQuantity(scale(newQuantity));
        holding.setAverageBuyPrice(newAverageBuyPrice);
        holding.setActive(true);

        Portfolio savedHolding = portfolioRepository.save(holding);
        saveTransaction(savedHolding, symbol, TransactionType.BUY, request.quantity(), marketPrice);

        return toHoldingResponse(savedHolding);
    }

    @Transactional
    public PortfolioHoldingResponse sellStock(String userEmail, PortfolioTradeRequest request) {
        String symbol = normalizeSymbol(request.symbol());
        Portfolio holding = getActiveHoldingBySymbol(userEmail, symbol);

        if (holding.getQuantity().compareTo(request.quantity()) < 0) {
            throw new InsufficientStockQuantityException(
                    "Cannot sell more " + symbol + " than currently owned"
            );
        }

        BigDecimal marketPrice = fetchMarketPrice(symbol);
        BigDecimal remainingQuantity = holding.getQuantity().subtract(request.quantity());
        holding.setQuantity(scale(remainingQuantity));

        if (remainingQuantity.compareTo(BigDecimal.ZERO) == 0) {
            holding.setActive(false);
            holding.setAverageBuyPrice(BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
        }

        Portfolio savedHolding = portfolioRepository.save(holding);
        saveTransaction(savedHolding, symbol, TransactionType.SELL, request.quantity(), marketPrice);

        return toHoldingResponse(savedHolding);
    }

    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getPortfolio(String userEmail) {
        List<PortfolioHoldingResponse> holdings = portfolioRepository
                .findAllByUserEmailAndActiveTrueOrderByStockSymbolAsc(userEmail)
                .stream()
                .map(this::toHoldingResponse)
                .toList();

        BigDecimal totalInvested = holdings.stream()
                .map(PortfolioHoldingResponse::totalInvested)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCurrentValue = holdings.stream()
                .map(PortfolioHoldingResponse::currentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PortfolioSummaryResponse(
                holdings,
                scale(totalInvested),
                scale(totalCurrentValue),
                scale(totalCurrentValue.subtract(totalInvested))
        );
    }

    @Transactional
    public void removeHolding(String userEmail, Long holdingId) {
        Portfolio holding = portfolioRepository.findByIdAndUserEmailAndActiveTrue(holdingId, userEmail)
                .orElseThrow(() -> new PortfolioHoldingNotFoundException("Portfolio holding not found"));

        holding.setActive(false);
        holding.setQuantity(BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
        holding.setAverageBuyPrice(BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
        portfolioRepository.save(holding);
    }

    private Portfolio createHolding(User user, String symbol) {
        Portfolio holding = new Portfolio();
        holding.setUser(user);
        holding.setName(symbol);
        holding.setStockSymbol(symbol);
        holding.setActive(true);
        holding.setQuantity(BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
        holding.setAverageBuyPrice(BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_UP));
        return holding;
    }

    private Portfolio getActiveHoldingBySymbol(String userEmail, String symbol) {
        return portfolioRepository.findByUserEmailAndStockSymbol(userEmail, symbol)
                .filter(Portfolio::isActive)
                .orElseThrow(() -> new PortfolioHoldingNotFoundException("No active holding found for " + symbol));
    }

    private User getUserByEmail(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new PortfolioHoldingNotFoundException("Authenticated user not found"));
    }

    private BigDecimal calculateAverageBuyPrice(Portfolio holding, BigDecimal buyQuantity, BigDecimal buyPrice) {
        BigDecimal existingCost = holding.getQuantity().multiply(holding.getAverageBuyPrice());
        BigDecimal newCost = buyQuantity.multiply(buyPrice);
        BigDecimal totalQuantity = holding.getQuantity().add(buyQuantity);

        return existingCost
                .add(newCost)
                .divide(totalQuantity, MONEY_SCALE, RoundingMode.HALF_UP);
    }

    private void saveTransaction(
            Portfolio holding,
            String symbol,
            TransactionType type,
            BigDecimal quantity,
            BigDecimal price
    ) {
        Transaction transaction = new Transaction();
        transaction.setPortfolio(holding);
        transaction.setStockSymbol(symbol);
        transaction.setType(type);
        transaction.setQuantity(scale(quantity));
        transaction.setPricePerShare(scale(price));
        transaction.setTransactionDate(LocalDate.now(ZoneOffset.UTC));

        transactionRepository.save(transaction);
    }

    private PortfolioHoldingResponse toHoldingResponse(Portfolio holding) {
        BigDecimal currentPrice = getCurrentPrice(holding);
        BigDecimal totalInvested = holding.getQuantity().multiply(holding.getAverageBuyPrice());
        BigDecimal currentValue = holding.getQuantity().multiply(currentPrice);

        return new PortfolioHoldingResponse(
                holding.getId(),
                holding.getStockSymbol(),
                scale(holding.getQuantity()),
                scale(holding.getAverageBuyPrice()),
                scale(totalInvested),
                scale(currentPrice),
                scale(currentValue),
                scale(currentValue.subtract(totalInvested))
        );
    }

    private BigDecimal getCurrentPrice(Portfolio holding) {
        return stockPriceRepository.findTopByStockSymbolOrderByPriceTimestampDesc(holding.getStockSymbol())
                .map(StockPrice::getPrice)
                .orElse(holding.getAverageBuyPrice());
    }

    private BigDecimal fetchMarketPrice(String symbol) {
        StockPriceResponse stockPrice = stockPriceService.fetchAndSaveLatestPrice(symbol);
        return stockPrice.price();
    }

    private String normalizeSymbol(String symbol) {
        return symbol.trim().toUpperCase(Locale.ROOT);
    }

    private BigDecimal scale(BigDecimal value) {
        return value.setScale(MONEY_SCALE, RoundingMode.HALF_UP);
    }
}
