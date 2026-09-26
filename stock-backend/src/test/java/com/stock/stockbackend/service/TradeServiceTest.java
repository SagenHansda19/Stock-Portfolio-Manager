package com.stock.stockbackend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

@ExtendWith(MockitoExtension.class)
class TradeServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PortfolioPositionRepository positionRepository;

    @Mock
    private TradeTransactionRepository transactionRepository;

    @Mock
    private StockPriceRepository stockPriceRepository;

    @InjectMocks
    private TradeService tradeService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .fullName("Test Investor")
                .email("investor@test.com")
                .passwordHash("hashed")
                .cashBalance(new BigDecimal("10000.0000"))
                .version(1L)
                .build();
        testUser.setId(10L);
    }

    @Test
    void executeTrade_BuySuccess_NewPosition() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        when(positionRepository.findByUserIdAndTicker(10L, "AAPL")).thenReturn(Optional.empty());

        when(positionRepository.save(any(PortfolioPosition.class))).thenAnswer(invocation -> {
            PortfolioPosition p = invocation.getArgument(0);
            p.setId(100L);
            return p;
        });

        when(transactionRepository.save(any(TradeTransaction.class))).thenAnswer(invocation -> {
            TradeTransaction t = invocation.getArgument(0);
            t.setId(500L);
            t.setExecutedAt(Instant.now());
            return t;
        });

        when(userRepository.saveAndFlush(any(User.class))).thenReturn(testUser);

        // AAPL mock price is 185.5000; 10 shares = 1855.0000
        TradeResponse response = tradeService.executeTrade(10L, "AAPL", 10, "BUY");

        assertNotNull(response);
        assertEquals("AAPL", response.getTicker());
        assertEquals("BUY", response.getAction());
        assertEquals(10, response.getQuantity());
        assertEquals(new BigDecimal("185.5000"), response.getPrice());
        assertEquals(new BigDecimal("1855.0000"), response.getTotalAmount());
        assertEquals(new BigDecimal("8145.0000"), testUser.getCashBalance());

        verify(positionRepository).save(any(PortfolioPosition.class));
        verify(transactionRepository).save(any(TradeTransaction.class));
        verify(userRepository).saveAndFlush(testUser);
    }

    @Test
    void executeTrade_Buy_InsufficientCashBalance_ThrowsException() {
        testUser.setCashBalance(new BigDecimal("100.0000"));
        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));

        assertThrows(InsufficientCashBalanceException.class, () ->
                tradeService.executeTrade(10L, "AAPL", 10, "BUY")
        );
    }

    @Test
    void executeTrade_SellSuccess_ExistingPosition() {
        PortfolioPosition existingPosition = PortfolioPosition.builder()
                .user(testUser)
                .ticker("AAPL")
                .quantity(new BigDecimal("20.0000"))
                .averageBuyPrice(new BigDecimal("170.0000"))
                .build();
        existingPosition.setId(100L);

        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        when(positionRepository.findByUserIdAndTicker(10L, "AAPL")).thenReturn(Optional.of(existingPosition));
        when(positionRepository.save(any(PortfolioPosition.class))).thenReturn(existingPosition);

        when(transactionRepository.save(any(TradeTransaction.class))).thenAnswer(invocation -> {
            TradeTransaction t = invocation.getArgument(0);
            t.setId(501L);
            t.setExecutedAt(Instant.now());
            return t;
        });

        when(userRepository.saveAndFlush(any(User.class))).thenReturn(testUser);

        // Sell 5 shares @ 185.50 = 927.50
        TradeResponse response = tradeService.executeTrade(10L, "AAPL", 5, "SELL");

        assertNotNull(response);
        assertEquals("SELL", response.getAction());
        assertEquals(5, response.getQuantity());
        assertEquals(new BigDecimal("15.0000"), existingPosition.getQuantity());
        assertEquals(new BigDecimal("10927.5000"), testUser.getCashBalance());
    }

    @Test
    void executeTrade_Sell_InsufficientShares_ThrowsException() {
        PortfolioPosition existingPosition = PortfolioPosition.builder()
                .user(testUser)
                .ticker("AAPL")
                .quantity(new BigDecimal("3.0000"))
                .averageBuyPrice(new BigDecimal("170.0000"))
                .build();

        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        when(positionRepository.findByUserIdAndTicker(10L, "AAPL")).thenReturn(Optional.of(existingPosition));

        assertThrows(InsufficientStockQuantityException.class, () ->
                tradeService.executeTrade(10L, "AAPL", 10, "SELL")
        );
    }

    @Test
    void executeTrade_OptimisticLockFailure_ThrowsTradeConflictException() {
        when(userRepository.findById(10L)).thenReturn(Optional.of(testUser));
        when(positionRepository.findByUserIdAndTicker(10L, "AAPL")).thenReturn(Optional.empty());
        when(positionRepository.save(any(PortfolioPosition.class))).thenReturn(new PortfolioPosition());
        when(transactionRepository.save(any(TradeTransaction.class))).thenReturn(new TradeTransaction());

        when(userRepository.saveAndFlush(any(User.class))).thenThrow(
                new ObjectOptimisticLockingFailureException(User.class, 10L)
        );

        assertThrows(TradeConflictException.class, () ->
                tradeService.executeTrade(10L, "AAPL", 1, "BUY")
        );
    }
}
