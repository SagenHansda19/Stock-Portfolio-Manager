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
                .connectTimeout(Duration.ofSeconds(2))
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
                    .commandTimeout(Duration.ofSeconds(2))
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
                    .commandTimeout(Duration.ofSeconds(2))
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
                log.warn("Redis/Valkey instance is unreachable during startup health-check: {}. Application startup proceeding with fail-open caching.", exception.getMessage());
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
        initialCacheConfigs.put(STOCK_HISTORY_RAW_CACHE, stockHistoryConfig);
        initialCacheConfigs.put(STOCK_CHART_CACHE, stockHistoryConfig);
        initialCacheConfigs.put(PORTFOLIO_ANALYSIS_CACHE, cacheConfiguration().entryTtl(Duration.ofMinutes(30)));

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
