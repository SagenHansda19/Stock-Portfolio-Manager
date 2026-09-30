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
import org.springframework.boot.ApplicationRunner;
import org.springframework.data.redis.connection.RedisConnection;
import org.springframework.beans.factory.annotation.Value;
import io.lettuce.core.ClientOptions;
import io.lettuce.core.SocketOptions;
import org.springframework.data.redis.connection.RedisConfiguration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig implements CachingConfigurer {

    public static final String STOCK_HISTORY_CACHE = "stockHistory";
    public static final String STOCK_HISTORY_RAW_CACHE = "stockHistoryRaw";
    public static final String STOCK_CHART_CACHE = "stockChart";
    public static final String PORTFOLIO_ANALYSIS_CACHE = "portfolioAnalysis";

    public static final Duration DEFAULT_CACHE_TTL = Duration.ofMinutes(15);
    public static final Duration INTRADAY_CACHE_TTL = Duration.ofSeconds(60);
    public static final Duration HISTORICAL_CACHE_TTL = Duration.ofHours(1);

    @Bean
    public LettuceConnectionFactory redisConnectionFactory(
            @Value("${REDIS_URL:${spring.data.redis.url:}}") String redisUrl,
            @Value("${spring.data.redis.host:localhost}") String host,
            @Value("${spring.data.redis.port:6379}") int port,
            @Value("${spring.data.redis.password:}") String password,
            @Value("${spring.data.redis.username:}") String username,
            @Value("${spring.data.redis.ssl.enabled:false}") boolean sslEnabled
    ) {
        String effectiveUrl = (redisUrl != null && !redisUrl.isBlank()) ? redisUrl.trim() : null;
        if (effectiveUrl == null) {
            String envUrl = System.getenv("REDIS_URL");
            if (envUrl != null && !envUrl.isBlank()) {
                effectiveUrl = envUrl.trim();
            }
        }

        SocketOptions socketOptions = SocketOptions.builder()
                .connectTimeout(Duration.ofSeconds(10))
                .keepAlive(true)
                .build();
        ClientOptions clientOptions = ClientOptions.builder()
                .socketOptions(socketOptions)
                .autoReconnect(true)
                .build();

        LettuceConnectionFactory factory;
        if (effectiveUrl != null && (effectiveUrl.startsWith("redis://") || effectiveUrl.startsWith("rediss://"))) {
            log.info("Configuring LettuceConnectionFactory using URL: {}", maskUrl(effectiveUrl));
            RedisConfiguration redisConfig = LettuceConnectionFactory.createRedisConfiguration(effectiveUrl);

            if (password != null && !password.isBlank() && redisConfig instanceof RedisStandaloneConfiguration standalone) {
                if (!standalone.getPassword().isPresent()) {
                    standalone.setPassword(RedisPassword.of(password.trim()));
                }
            }
            if (username != null && !username.isBlank() && redisConfig instanceof RedisStandaloneConfiguration standalone) {
                if (standalone.getUsername() == null || standalone.getUsername().isBlank()) {
                    standalone.setUsername(username.trim());
                }
            }

            boolean isSsl = effectiveUrl.startsWith("rediss://") || sslEnabled;
            LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfigBuilder = LettuceClientConfiguration.builder()
                    .commandTimeout(Duration.ofSeconds(10))
                    .clientOptions(clientOptions);
            if (isSsl) {
                clientConfigBuilder.useSsl();
            }

            factory = new LettuceConnectionFactory(redisConfig, clientConfigBuilder.build());
        } else {
            log.info("Configuring LettuceConnectionFactory to host [{}:{}] (SSL: {})", host, port, sslEnabled);
            RedisStandaloneConfiguration standaloneConfig = new RedisStandaloneConfiguration(host, port);
            if (password != null && !password.isBlank()) {
                standaloneConfig.setPassword(RedisPassword.of(password.trim()));
            }
            if (username != null && !username.isBlank()) {
                standaloneConfig.setUsername(username.trim());
            }

            boolean isSsl = sslEnabled || port == 6380;
            LettuceClientConfiguration.LettuceClientConfigurationBuilder clientConfigBuilder = LettuceClientConfiguration.builder()
                    .commandTimeout(Duration.ofSeconds(10))
                    .clientOptions(clientOptions);
            if (isSsl) {
                clientConfigBuilder.useSsl();
            }

            factory = new LettuceConnectionFactory(standaloneConfig, clientConfigBuilder.build());
        }

        // Set validateConnection to false so Spring Boot bean creation does not block on remote Redis ping
        factory.setValidateConnection(false);
        factory.afterPropertiesSet();
        return factory;
    }

    @Bean
    public ApplicationRunner redisHealthCheckRunner(RedisConnectionFactory connectionFactory) {
        return args -> {
            log.info("Performing non-blocking startup health-check ping to Redis/Valkey instance...");
            try (RedisConnection connection = connectionFactory.getConnection()) {
                String pingResponse = connection.ping();
                log.info("SUCCESS: Connected to Redis/Valkey instance. PING response: [{}]", pingResponse);
            } catch (Exception exception) {
                log.warn("Redis/Valkey instance is temporarily unreachable during startup health-check: {}. Lettuce connection watchdog will handle automatic background reconnection. Application continuing with fail-open caching.", exception.getMessage());
            }
        };
    }

    private static String maskUrl(String url) {
        return url != null ? url.replaceAll(":[^:@]+@", ":****@") : "";
    }

    @Bean
    public RedisCacheConfiguration cacheConfiguration() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(DEFAULT_CACHE_TTL)
                .disableCachingNullValues()
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer()
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
                                new org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer()
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
        RedisCacheWriter loggingCacheWriter = new RedisCacheWriter() {
            private final RedisCacheWriter delegate = RedisCacheWriter.nonLockingRedisCacheWriter(connectionFactory);

            @Override
            public void put(String name, byte[] key, byte[] value, Duration ttl) {
                delegate.put(name, key, value, ttl);
                log.info("REDIS CACHE WRITE SUCCESS: Cache [{}] stored key [{}] ({} bytes) with TTL={}",
                        name, new String(key, java.nio.charset.StandardCharsets.UTF_8), value.length, ttl);
            }

            @Override
            public byte[] get(String name, byte[] key) {
                byte[] val = delegate.get(name, key);
                String keyStr = new String(key, java.nio.charset.StandardCharsets.UTF_8);
                if (val != null) {
                    log.info("REDIS CACHE HIT: Cache [{}] found key [{}] ({} bytes)", name, keyStr, val.length);
                } else {
                    log.info("REDIS CACHE MISS: Cache [{}] key [{}] not found in Redis", name, keyStr);
                }
                return val;
            }

            @Override
            public java.util.concurrent.CompletableFuture<byte[]> retrieve(String name, byte[] key, Duration ttl) {
                return delegate.retrieve(name, key, ttl);
            }

            @Override
            public java.util.concurrent.CompletableFuture<Void> store(String name, byte[] key, byte[] value, Duration ttl) {
                return delegate.store(name, key, value, ttl);
            }

            @Override
            public byte[] putIfAbsent(String name, byte[] key, byte[] value, Duration ttl) {
                return delegate.putIfAbsent(name, key, value, ttl);
            }

            @Override
            public void remove(String name, byte[] key) {
                delegate.remove(name, key);
            }

            @Override
            public void evict(String name, byte[] key) {
                delegate.evict(name, key);
                log.info("REDIS CACHE EVICT: Cache [{}] evicted key [{}]",
                        name, new String(key, java.nio.charset.StandardCharsets.UTF_8));
            }

            @Override
            public void clean(String name, byte[] pattern) {
                delegate.clean(name, pattern);
            }

            @Override
            public void clear(String name, byte[] pattern) {
                delegate.clear(name, pattern);
                log.info("REDIS CACHE CLEAR: Cache [{}] cleared", name);
            }

            @Override
            public void clearStatistics(String name) {
                delegate.clearStatistics(name);
            }

            @Override
            public org.springframework.data.redis.cache.CacheStatistics getCacheStatistics(String name) {
                return delegate.getCacheStatistics(name);
            }

            @Override
            public RedisCacheWriter withStatisticsCollector(org.springframework.data.redis.cache.CacheStatisticsCollector cacheStatisticsCollector) {
                return delegate.withStatisticsCollector(cacheStatisticsCollector);
            }
        };

        Map<String, RedisCacheConfiguration> initialCacheConfigs = new HashMap<>();
        RedisCacheConfiguration stockHistoryConfig = stockHistoryCacheConfiguration();
        initialCacheConfigs.put(STOCK_HISTORY_CACHE, stockHistoryConfig);
        initialCacheConfigs.put(STOCK_HISTORY_RAW_CACHE, stockHistoryConfig);
        initialCacheConfigs.put(STOCK_CHART_CACHE, stockHistoryConfig);
        initialCacheConfigs.put(PORTFOLIO_ANALYSIS_CACHE, cacheConfiguration().entryTtl(Duration.ofMinutes(30)));

        return RedisCacheManager.builder(loggingCacheWriter)
                .cacheDefaults(cacheConfiguration())
                .withInitialCacheConfigurations(initialCacheConfigs)
                .build();
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.error("Redis Cache GET failed for key [{}] in cache [{}]: {}. Falling back to source.",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage(), exception);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.error("Redis Cache PUT failed for key [{}] in cache [{}]: {}",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage(), exception);
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.error("Redis Cache EVICT failed for key [{}] in cache [{}]: {}",
                        key, cache != null ? cache.getName() : "unknown", exception.getMessage(), exception);
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.error("Redis Cache CLEAR failed in cache [{}]: {}",
                        cache != null ? cache.getName() : "unknown", exception.getMessage(), exception);
            }
        };
    }
}
