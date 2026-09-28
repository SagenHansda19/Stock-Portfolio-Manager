package com.stock.stockbackend.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

import java.time.Duration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
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
    void errorHandler_HandlesErrorsGracefullyWithoutThrowing() {
        CacheErrorHandler errorHandler = cacheConfig.errorHandler();
        assertNotNull(errorHandler);

        // Ensure error handlers do not throw exceptions to caller
        RuntimeException dummyEx = new RuntimeException("Redis connection timed out");
        errorHandler.handleCacheGetError(dummyEx, null, "AAPL_1D");
        errorHandler.handleCachePutError(dummyEx, null, "AAPL_1D", "value");
        errorHandler.handleCacheEvictError(dummyEx, null, "AAPL_1D");
        errorHandler.handleCacheClearError(dummyEx, null);
    }
}
