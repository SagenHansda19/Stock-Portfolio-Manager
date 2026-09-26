package com.stock.stockbackend.entity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.stock.stockbackend.enums.TransactionType;
import jakarta.persistence.Version;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserEntityTest {

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Test
    void userEntity_HasVersionAnnotation() throws NoSuchFieldException {
        Field versionField = User.class.getDeclaredField("version");
        assertNotNull(versionField);
        assertTrue(versionField.isAnnotationPresent(Version.class), "User version field must have @Version annotation");
        assertEquals(Long.class, versionField.getType(), "User version field must be of type Long");
    }

    @Test
    void userEntity_DefaultVersionIsZero() {
        User defaultUser = new User();
        assertEquals(0L, defaultUser.getVersion(), "New User instance must have version initialized to 0L");

        User builtUser = User.builder()
                .fullName("Test Investor")
                .email("test@investor.com")
                .build();
        assertEquals(0L, builtUser.getVersion(), "User built via @Builder must have version initialized to 0L");
    }

    @Test
    void userEntity_NullVersionNormalizesToZero() {
        User user = new User();
        user.setVersion(null);
        assertEquals(0L, user.getVersion(), "Null version must normalize to 0L via null-safe getter");
    }

    @Test
    void portfolioPosition_HasVersionAnnotationAndDefaultsToZero() throws NoSuchFieldException {
        Field versionField = PortfolioPosition.class.getDeclaredField("version");
        assertNotNull(versionField);
        assertTrue(versionField.isAnnotationPresent(Version.class), "PortfolioPosition version field must have @Version annotation");

        PortfolioPosition defaultPosition = new PortfolioPosition();
        assertEquals(0L, defaultPosition.getVersion(), "New PortfolioPosition instance must have version initialized to 0L");

        PortfolioPosition builtPosition = PortfolioPosition.builder()
                .ticker("AAPL")
                .build();
        assertEquals(0L, builtPosition.getVersion(), "PortfolioPosition built via @Builder must have version initialized to 0L");

        builtPosition.setVersion(null);
        assertEquals(0L, builtPosition.getVersion(), "Null version on PortfolioPosition must normalize to 0L");
    }

    @Test
    void userEntity_InitializesCollectionsAndFields() {
        User user = User.builder()
                .fullName("Test Investor")
                .email("test@investor.com")
                .passwordHash("secret")
                .cashBalance(new BigDecimal("50000.0000"))
                .build();

        assertNotNull(user.getPositions());
        assertNotNull(user.getTransactions());
        assertNotNull(user.getWatchlistItems());
        assertEquals(0L, user.getVersion());
    }

    @Test
    void serialization_PortfolioPositionBreaksCircularReferenceToUser() throws Exception {
        User user = User.builder()
                .fullName("Jane Doe")
                .email("jane@example.com")
                .build();

        PortfolioPosition position = PortfolioPosition.builder()
                .ticker("MSFT")
                .quantity(new BigDecimal("15.0000"))
                .averageBuyPrice(new BigDecimal("320.5000"))
                .user(user)
                .build();

        user.getPositions().add(position);

        String json = objectMapper.writeValueAsString(position);
        assertNotNull(json);
        assertTrue(json.contains("\"ticker\":\"MSFT\""));
        assertFalse(json.contains("\"user\""), "Serialized PortfolioPosition must not contain circular user field");
        assertFalse(json.contains("\"transactions\""), "Serialized PortfolioPosition must not serialize transactions list");
    }

    @Test
    void serialization_TradeTransactionBreaksCircularReferenceToUserAndPosition() throws Exception {
        User user = User.builder()
                .fullName("Jane Doe")
                .email("jane@example.com")
                .build();

        PortfolioPosition position = PortfolioPosition.builder()
                .ticker("NVDA")
                .user(user)
                .build();

        TradeTransaction trade = TradeTransaction.builder()
                .ticker("NVDA")
                .action(TransactionType.BUY)
                .quantity(10)
                .price(new BigDecimal("450.0000"))
                .totalAmount(new BigDecimal("4500.0000"))
                .executedAt(Instant.now())
                .user(user)
                .portfolioPosition(position)
                .build();

        user.getTransactions().add(trade);
        position.getTransactions().add(trade);

        String json = objectMapper.writeValueAsString(trade);
        assertNotNull(json);
        assertTrue(json.contains("\"ticker\":\"NVDA\""));
        assertFalse(json.contains("\"user\""), "Serialized TradeTransaction must not contain circular user field");
        assertFalse(json.contains("\"portfolioPosition\""), "Serialized TradeTransaction must not contain circular portfolioPosition field");
    }

    @Test
    void serialization_WatchlistItemBreaksCircularReferenceToUser() throws Exception {
        User user = User.builder()
                .fullName("Jane Doe")
                .email("jane@example.com")
                .build();

        WatchlistItem item = WatchlistItem.builder()
                .ticker("TSLA")
                .addedAt(Instant.now())
                .user(user)
                .build();

        user.getWatchlistItems().add(item);

        String json = objectMapper.writeValueAsString(item);
        assertNotNull(json);
        assertTrue(json.contains("\"ticker\":\"TSLA\""));
        assertFalse(json.contains("\"user\""), "Serialized WatchlistItem must not contain circular user field");
    }

    @Test
    void serialization_UserSerializesOneToManyCollectionsWithoutRecursion() throws Exception {
        User user = User.builder()
                .fullName("John Trader")
                .email("john@trader.com")
                .passwordHash("hashed_secret")
                .cashBalance(new BigDecimal("100000.0000"))
                .build();

        PortfolioPosition position = PortfolioPosition.builder()
                .ticker("AAPL")
                .quantity(new BigDecimal("25.0000"))
                .averageBuyPrice(new BigDecimal("180.0000"))
                .user(user)
                .build();
        user.getPositions().add(position);

        TradeTransaction trade = TradeTransaction.builder()
                .ticker("AAPL")
                .action(TransactionType.BUY)
                .quantity(25)
                .price(new BigDecimal("180.0000"))
                .totalAmount(new BigDecimal("4500.0000"))
                .executedAt(Instant.now())
                .user(user)
                .portfolioPosition(position)
                .build();
        user.getTransactions().add(trade);

        WatchlistItem item = WatchlistItem.builder()
                .ticker("GOOGL")
                .addedAt(Instant.now())
                .user(user)
                .build();
        user.getWatchlistItems().add(item);

        // Serialize the parent user entity containing bidirectional child collections
        String json = objectMapper.writeValueAsString(user);
        assertNotNull(json);
        assertTrue(json.contains("\"fullName\":\"John Trader\""));
        assertTrue(json.contains("\"positions\":["), "User must serialize positions array");
        assertTrue(json.contains("\"ticker\":\"AAPL\""));
        assertTrue(json.contains("\"transactions\":["), "User must serialize transactions array");
        assertTrue(json.contains("\"watchlistItems\":["), "User must serialize watchlistItems array");
        assertTrue(json.contains("\"ticker\":\"GOOGL\""));
        assertFalse(json.contains("\"passwordHash\""), "User must not expose passwordHash in JSON");
    }
}
