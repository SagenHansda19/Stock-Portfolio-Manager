package com.stock.stockbackend.config;

import java.time.Duration;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig implements CachingConfigurer {

    public static final String STOCK_HISTORY_CACHE = "stockHistory";
    public static final String STOCK_CHART_CACHE = "stockChart";

    public static final Duration DEFAULT_CACHE_TTL = Duration.ofMinutes(15);
    public static final Duration INTRADAY_CACHE_TTL = Duration.ofSeconds(60);
    public static final Duration HISTORICAL_CACHE_TTL = Duration.ofHours(1);

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(DEFAULT_CACHE_TTL)
                .disableCachingNullValues()
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                RedisSerializer.json()
                        )
                );
    }

    @Bean
    public RedisCacheConfiguration stockHistoryCacheConfiguration() {
        RedisCacheWriter.TtlFunction stockHistoryTtlFunction = (key, value) -> {
            if (key != null) {
                String keyStr = key.toString().toUpperCase(Locale.ROOT);
                if (isIntradayKey(keyStr)) {
                    return INTRADAY_CACHE_TTL;
                }
            }
            return HISTORICAL_CACHE_TTL;
        };

        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(stockHistoryTtlFunction)
                .disableCachingNullValues()
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                RedisSerializer.json()
                        )
                );
    }

    public static boolean isIntradayKey(String keyStr) {
        if (keyStr == null) {
            return false;
        }
        String upper = keyStr.toUpperCase(Locale.ROOT);
        return upper.endsWith("_1D")
                || upper.endsWith("_5MIN")
                || upper.endsWith("_1MIN")
                || upper.endsWith("_15MIN")
                || upper.endsWith("_30MIN")
                || upper.endsWith("_INTRADAY")
                || upper.contains("_1D_")
                || upper.contains("_5MIN_");
    }

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        Map<String, RedisCacheConfiguration> initialCacheConfigs = new HashMap<>();
        RedisCacheConfiguration stockHistoryConfig = stockHistoryCacheConfiguration();
        initialCacheConfigs.put(STOCK_HISTORY_CACHE, stockHistoryConfig);
        initialCacheConfigs.put(STOCK_CHART_CACHE, stockHistoryConfig);

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(cacheConfiguration())
                .withInitialCacheConfigurations(initialCacheConfigs)
                .build();
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis Cache GET failed for key [{}] in cache [{}]: {}. Falling back to source.",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Redis Cache PUT failed for key [{}] in cache [{}]: {}",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Redis Cache EVICT failed for key [{}] in cache [{}]: {}",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Redis Cache CLEAR failed in cache [{}]: {}",
                        cache != null ? cache.getName() : "unknown", exception.getMessage());
            }
        };
    }
}
