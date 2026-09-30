package com.stock.stockbackend.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.data.redis.connection.RedisConnectionFactory;

class CacheConfigTest {

    private CacheConfig cacheConfig;

    @BeforeEach
    void setUp() {
        cacheConfig = new CacheConfig();
    }

    @Test
    void isIntradayKey_IdentifiesIntradayTimeframesCorrectly() {
        // Intraday keys
        assertTrue(CacheConfig.isIntradayKey("AAPL_1D"));
        assertTrue(CacheConfig.isIntradayKey("aapl_1d"));
        assertTrue(CacheConfig.isIntradayKey("MSFT_5MIN"));
        assertTrue(CacheConfig.isIntradayKey("TSLA_1MIN"));
        assertTrue(CacheConfig.isIntradayKey("NVDA_15MIN"));
        assertTrue(CacheConfig.isIntradayKey("GOOGL_30MIN"));
        assertTrue(CacheConfig.isIntradayKey("AMZN_INTRADAY"));

        // Historical keys
        assertFalse(CacheConfig.isIntradayKey("AAPL_1W"));
        assertFalse(CacheConfig.isIntradayKey("AAPL_1M"));
        assertFalse(CacheConfig.isIntradayKey("AAPL_1Y"));
        assertFalse(CacheConfig.isIntradayKey("AAPL_ALL"));
        assertFalse(CacheConfig.isIntradayKey(null));
    }

    @Test
    void stockHistoryCacheConfiguration_AppliesDynamicTtl() {
        RedisCacheConfiguration config = cacheConfig.stockHistoryCacheConfiguration();
        assertNotNull(config);
        assertNotNull(config.getTtlFunction());

        // Test intraday TTL (60 seconds)
        Duration intradayTtl = config.getTtlFunction().getTimeToLive("AAPL_1D", null);
        assertEquals(Duration.ofSeconds(60), intradayTtl);

        Duration fiveMinTtl = config.getTtlFunction().getTimeToLive("AAPL_5MIN", null);
        assertEquals(Duration.ofSeconds(60), fiveMinTtl);

        // Test historical TTL (1 hour)
        Duration weeklyTtl = config.getTtlFunction().getTimeToLive("AAPL_1W", null);
        assertEquals(Duration.ofHours(1), weeklyTtl);

        Duration monthlyTtl = config.getTtlFunction().getTimeToLive("AAPL_1M", null);
        assertEquals(Duration.ofHours(1), monthlyTtl);

        Duration yearlyTtl = config.getTtlFunction().getTimeToLive("AAPL_1Y", null);
        assertEquals(Duration.ofHours(1), yearlyTtl);

        Duration allTtl = config.getTtlFunction().getTimeToLive("AAPL_ALL", null);
        assertEquals(Duration.ofHours(1), allTtl);
    }

    @Test
    void cacheManager_BuildsWithStockHistoryConfigurations() {
        RedisConnectionFactory connectionFactory = mock(RedisConnectionFactory.class);
        RedisCacheManager manager = cacheConfig.cacheManager(connectionFactory);
        manager.afterPropertiesSet();

        assertNotNull(manager);
        assertNotNull(manager.getCacheConfigurations().get(CacheConfig.STOCK_HISTORY_CACHE));
        assertNotNull(manager.getCacheConfigurations().get(CacheConfig.STOCK_HISTORY_RAW_CACHE));
        assertNotNull(manager.getCacheConfigurations().get(CacheConfig.STOCK_CHART_CACHE));
        assertNotNull(manager.getCacheConfigurations().get(CacheConfig.PORTFOLIO_ANALYSIS_CACHE));
    }

    @Test
    void redisConnectionFactory_WithRedisUrl_CreatesFactory() {
        RedisConnectionFactory factory = cacheConfig.redisConnectionFactory(
                "redis://default:mysecret@valkey.render.internal:6379",
                "localhost",
                6379,
                null,
                null,
                false
        );
        assertNotNull(factory);
    }

    @Test
    void redisConnectionFactory_WithHostAndPortAndCredentials_CreatesFactory() {
        RedisConnectionFactory factory = cacheConfig.redisConnectionFactory(
                null,
                "render-valkey-host",
                6379,
                "renderSecretPass",
                "default",
                false
        );
        assertNotNull(factory);
    }

    @Test
    void redisConnectionFactory_WithSslEnabled_CreatesFactory() {
        RedisConnectionFactory factory = cacheConfig.redisConnectionFactory(
                null,
                "render-valkey-host",
                6380,
                "renderSecretPass",
                "default",
                true
        );
        assertNotNull(factory);
    }

    @Test
    void redisHealthCheckRunner_WhenPingSucceeds_RunsCleanly() throws Exception {
        RedisConnectionFactory connectionFactory = mock(RedisConnectionFactory.class);
        RedisConnection connection = mock(RedisConnection.class);
        when(connectionFactory.getConnection()).thenReturn(connection);
        when(connection.ping()).thenReturn("PONG");

        ApplicationRunner runner = cacheConfig.redisHealthCheckRunner(connectionFactory);
        assertNotNull(runner);
        runner.run(new DefaultApplicationArguments());

        verify(connection).ping();
    }

    @Test
    void redisHealthCheckRunner_WhenPingFails_DoesNotThrowAndFailsOpenGracefully() throws Exception {
        RedisConnectionFactory connectionFactory = mock(RedisConnectionFactory.class);
        RedisConnection connection = mock(RedisConnection.class);
        when(connectionFactory.getConnection()).thenReturn(connection);
        when(connection.ping()).thenThrow(new RuntimeException("Connection timed out"));

        ApplicationRunner runner = cacheConfig.redisHealthCheckRunner(connectionFactory);
        assertNotNull(runner);
        runner.run(new DefaultApplicationArguments());
    }

    @Test
    void stockHistorySerialization_SerializesAndDeserializesCorrectly() {
        var serializer = new org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer();
        var point = new com.stock.stockbackend.dto.StockHistoryPointResponse("10:00", new java.math.BigDecimal("182.5000"));
        java.util.List<com.stock.stockbackend.dto.StockHistoryPointResponse> list = new java.util.ArrayList<>();
        list.add(point);

        byte[] bytes = serializer.serialize(list);
        assertNotNull(bytes);

        Object deserialized = serializer.deserialize(bytes);
        assertNotNull(deserialized);
        assertTrue(deserialized instanceof java.util.List<?>);
        java.util.List<?> desList = (java.util.List<?>) deserialized;
        assertEquals(1, desList.size());
        assertTrue(desList.get(0) instanceof com.stock.stockbackend.dto.StockHistoryPointResponse);
        com.stock.stockbackend.dto.StockHistoryPointResponse desPoint =
                (com.stock.stockbackend.dto.StockHistoryPointResponse) desList.get(0);
        assertEquals("10:00", desPoint.time());
        assertEquals(new java.math.BigDecimal("182.5000"), desPoint.price());

        // Test PortfolioAnalysisDto
        var dto = com.stock.stockbackend.dto.PortfolioAnalysisDto.builder()
                .portfolioScore(85)
                .riskLevel("Moderate")
                .summary("Healthy portfolio")
                .strengths(java.util.List.of("Strong cash flow"))
                .build();

        byte[] dtoBytes = serializer.serialize(dto);
        Object deserializedDto = serializer.deserialize(dtoBytes);
        assertNotNull(deserializedDto);
        assertTrue(deserializedDto instanceof com.stock.stockbackend.dto.PortfolioAnalysisDto);
        assertEquals(85, ((com.stock.stockbackend.dto.PortfolioAnalysisDto) deserializedDto).getPortfolioScore());
    }
}
