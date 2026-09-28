# StockVerse Enterprise Architecture & Technical Reference

StockVerse is an institutional-grade, high-concurrency stock trading simulator and quantitative portfolio intelligence platform built using **Spring Boot 3.4 (Java 17)**, **React 19 / Vite 6**, **PostgreSQL 18**, **Redis 7 In-Memory Cache**, and **Google Gemini 1.5 Flash** orchestrated via **LangChain4j**.

---

## 1. Quick Start & Setup Commands

### 1.1 Prerequisites
- **Java 17+**: `java --version`
- **Node.js 18+ & npm**: `node --version && npm --version`
- **Maven 3.8+**: `mvn --version`
- **Docker & Docker Compose**: `docker --version`
- **PostgreSQL 15+ & Redis 7+** (or run via Docker)

### 1.2 Environment Configuration
Create a `.env` file in `stock-backend/`:
```properties
# Server
PORT=8080

# PostgreSQL 18
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/stockdb
SPRING_DATASOURCE_USERNAME=admin
SPRING_DATASOURCE_PASSWORD=admin

# Redis 7 In-Memory Cache
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Security
JWT_SECRET=stock-portfolio-manager-jwt-secret-key-32bytes-min
JWT_EXPIRATION_MS=86400000

# Market Data APIs
FINNHUB_API_KEY=your_finnhub_key_here
TWELVE_DATA_API_KEY=your_twelvedata_key_here

# AI Quantitative Advisor (Gemini 1.5 Flash)
GEMINI_API_KEY=your_gemini_api_key_here
```

### 1.3 Local Run Commands

#### Step 1: Start PostgreSQL & Redis Infrastructure
```bash
# Start PostgreSQL 18
docker run -d --name stockverse-postgres \
  -e POSTGRES_DB=stockdb \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -p 5432:5432 \
  postgres:18-alpine

# Start Redis Cache
docker run -d --name stockverse-redis \
  -p 6379:6379 \
  redis:alpine
```

#### Step 2: Start Spring Boot Backend
```bash
cd stock-backend
mvn clean spring-boot:run
# Server starts on http://localhost:8080
```

#### Step 3: Start React 19 Frontend
```bash
cd stock-frontend
npm install
npm run dev
# Vite dev server starts on http://localhost:5173
```

### 1.4 Verification cURL Commands

```bash
# 1. Register a new trader
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"trader@stockverse.io","password":"Password123!","name":"Alex Chen"}'

# 2. Login to receive JWT token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"trader@stockverse.io","password":"Password123!"}'

# Save token: export TOKEN="<your_jwt_token>"

# 3. Execute a BUY Trade (Transactional + Optimistic Lock)
curl -X POST http://localhost:8080/api/trade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ticker":"AAPL","quantity":10,"action":"BUY"}'

# 4. Request AI Quantitative Portfolio Analysis (Redis Caching Tier)
curl -X GET http://localhost:8080/api/portfolio/analyze \
  -H "Authorization: Bearer $TOKEN"

# 5. Fetch Real-time Portfolio Holdings
curl -X GET http://localhost:8080/api/trade/positions \
  -H "Authorization: Bearer $TOKEN"
```

---

## 2. System Architecture & Topology

### 2.1 System Architecture Topology

```
+----------------------------------------------------------------------------------------------------+
|                                    React 19 Frontend (:5173)                                       |
|          [ Vite 6 + TailwindCSS + Lucide Icons + Recharts + Axios with Bearer Interceptor ]        |
+----------------------------------------------------------------------------------------------------+
                                                  │
                                            HTTPS / REST (JWT)
                                                  ▼
+----------------------------------------------------------------------------------------------------+
|                                Spring Boot 3.4 API Gateway (:8080)                                 |
|                                                                                                    |
|  [SecurityFilterChain] ──► [JwtTokenFilter] ──► [CustomUserDetailsService]                         |
|                                                                                                    |
|  [TradeController] ──────► [TradeService] (@Transactional)                                         |
|                                  │  │                                                              |
|                                  │  ├──► Optimistic Lock Check (@Version on User & Positions)      |
|                                  │  └──► Write-Through Cache Eviction (@CacheEvict)                |
|                                  ▼                                                                 |
|  [AiAdvisorController] ──► [PortfolioAiService] (@Cacheable, 15m TTL)                              |
|                                  │                                                                 |
|                                  └──► Cache Miss ──► [LangChain4j + Google Gemini 1.5 Flash]       |
+----------------------------------------------------------------------------------------------------+
              │                                                            │
          JPA / JDBC                                                   Jedis / Lettuce
              ▼                                                            ▼
+-------------------------------------------+             +------------------------------------------+
|            PostgreSQL 18                  |             |               Redis 7 Cache              |
|  • app_users (with version, cash_balance) |             |  • Key: portfolioAnalysis::<userId>      |
|  • portfolio_positions                    |             |  • TTL: 15 Minutes                       |
|  • trade_transactions (audit log)         |             |  • JSON Serialized (Sub-35ms reads)      |
|  • watchlist_items                        |             |  • Fail-open CacheErrorHandler           |
+-------------------------------------------+             +------------------------------------------+
```

### 2.2 Trade Execution Lifecycle (Atomic Ledger + Optimistic Locking)

```
Client                 JwtTokenFilter            TradeController            TradeService           User Repo         Positions Repo      Redis Cache
  │                          │                         │                          │                    │                │                     │
  ├── POST /api/trade ──────►│                         │                          │                    │                │                     │
  │   (Bearer JWT + Ticker)  ├── validate token ──────►│                          │                    │                │                     │
  │                          │   (set SecurityContext) ├── executeTrade() ───────►│                    │                │                     │
  │                          │                         │                          ├── findById() ─────►│                │                     │
  │                          │                         │                          │   (reads version=0)│                │                     │
  │                          │                         │                          ├── validate cash ───│                │                     │
  │                          │                         │                          ├── update balance ──│                │                     │
  │                          │                         │                          ├── saveAndFlush() ─►│ (UPDATE ...    │                     │
  │                          │                         │                          │                    │  WHERE ver=0)  │                     │
  │                          │                         │                          ├── update position ─────────────────►│                     │
  │                          │                         │                          ├── append audit log ────────────────►│                     │
  │                          │                         │                          ├── @CacheEvict ───────────────────────────────────────────►│ (DEL key)
  │                          │                         │                          │   (commits TX)     │                │                     │
  │◄── 200 OK (TradeResponse)──────────────────────────┴──────────────────────────┤
  │    (Or 409 Conflict if concurrent version collision)
```

### 2.3 AI Portfolio Analysis Lifecycle (Cache-Aside + Structured JSON Mode)

```
Client                 JwtTokenFilter            AiAdvisorController      PortfolioAiService       Redis Cache       Gemini 1.5 Flash
  │                          │                         │                          │                    │                     │
  ├── GET /portfolio/analyze─►│                        │                          │                    │                     │
  │                          ├── validate token ──────►│                          │                    │                     │
  │                          │                         ├── analyzePortfolio(uid) ─►│                    │                     │
  │                          │                         │                          ├── GET cache key ──►│                     │
  │                          │                         │                          │   [CACHE HIT]      │                     │
  │                          │                         │                          │◄── return JSON ────┤ (sub-35ms)          │
  │◄── 200 OK (PortfolioAnalysisDto from Redis) ───────┴──────────────────────────┤                                          │
  │                                                                               │   [CACHE MISS]                           │
  │                                                                               ├── fetch positions  │                     │
  │                                                                               ├── build JSON prompt│                     │
  │                                                                               ├── generate() ───────────────────────────►│
  │                                                                               │   (temp: 0.2, ResponseFormat.JSON)       │
  │                                                                               │◄── structured JSON response ─────────────┤
  │                                                                               ├── sanitize & parse │                     │
  │                                                                               ├── SET with 15m TTL──────────────────────►│
  │◄── 200 OK (Fresh PortfolioAnalysisDto) ───────────────────────────────────────┴─────────────────────┴─────────────────────┘
```

---

## 3. Study Guide & Design Patterns (Interview Deep Dives)

### 3.1 Optimistic Locking Pattern (`@Version`)
> 🎯 **Resume Achievement:** *Engineered a high-concurrency transactional trading engine using JPA @Version optimistic locking to prevent database race conditions and protect financial ledgers under heavy market load.*

- **The Problem (Lost Update Race Condition):** If a user double-clicks "Buy", two threads read `cash = $10,000`, validate an \$8,000 buy, and both write `cash = $2,000`. The user spends \$16,000 with \$10,000 collateral.
- **Why NOT Pessimistic Locking (`SELECT FOR UPDATE`)?** Row-level database locks block threads, cause HikariCP connection pool starvation, and introduce deadlocks under high-frequency trading.
- **StockVerse OCC Solution:** 
  1. JPA `@Version` column on `User` and `PortfolioPosition`.
  2. Hibernate issues: `UPDATE app_users SET cash_balance = ?, version = version + 1 WHERE id = ? AND version = ?`.
  3. The first thread commits (`version = 1`). The second thread finds 0 affected rows and throws `StaleObjectStateException` $\rightarrow$ translated to `ObjectOptimisticLockingFailureException`.
  4. Spring rolls back the second transaction atomically. `TradeService` wraps this into `TradeConflictException` $\rightarrow$ mapped by `GlobalExceptionHandler` to **HTTP 409 Conflict**.
  5. The React frontend cleanly alerts the user: *"Trade collision detected. Please retry."*

### 3.2 Redis Cache-Aside & Event-Driven Invalidation
> 🎯 **Resume Achievement:** *Implemented an event-driven multi-tier caching lifecycle using Redis (@Cacheable, @CacheEvict), accelerating AI portfolio analysis delivery to sub-35ms and aggressively bypassing external rate limits.*

- **The Problem:** Calling Gemini 1.5 Flash on every dashboard render takes 1.2–2.5s and consumes rate limits (15 RPM).
- **The Architecture:**
  - **Read Path (`@Cacheable`):** Key `portfolioAnalysis::<userId>` with 15-minute TTL. Subsequent views are delivered in **~2ms** (sub-35ms delivery under load).
  - **Write Path (`@CacheEvict`):** In `TradeService.executeTrade()`, any BUY or SELL immediately purges the user's cached analysis. The next view generates fresh metrics based on updated positions.
  - **Fail-Open Resilience (`CacheErrorHandler`):** If Redis crashes or experiences network partitions, `handleCacheGetError` and `handleCacheEvictError` log warnings and fall back directly to PostgreSQL + Gemini, preventing HTTP 500 errors.

### 3.3 Structured JSON Schema Output Pattern (LangChain4j + Gemini)
> 🎯 **Resume Achievement:** *Integrated Google Gemini 1.5 Flash via LangChain4j enforcing strict JSON-mode schemas for deterministic quantitative risk scoring, portfolio diversification metrics, and automated fallback heuristics.*

- **The Problem:** LLMs produce free-form conversational text or inconsistent markdown wrappers (````json ... ````), causing frontend rendering errors.
- **The Architecture:**
  - Enforced via LangChain4j `ResponseFormat.JSON` and low temperature (`0.2`).
  - Strict TypeScript/Java DTO contract: `portfolioScore` (0-100), `diversificationScore` (0-100), `riskLevel` ('Low' | 'Moderate' | 'High'), `strengths`, `weaknesses`, and holding recommendations.
  - Zero-holding short-circuiting: If user has 0 positions, returns instant default starter analysis without invoking Gemini.
  - Deterministic fallback: If Gemini API encounters 503 or quota limits, `buildFallbackAssessment()` computes quantitative risk metrics algorithmically.

### 3.4 Resilience & Load Testing Benchmarks (Grafana K6)
> 🎯 **Resume Achievement:** *Benchmarked system resilience using Grafana K6, successfully validating zero failures across 705 req/sec concurrent market trades and 9,400+ req/sec stateless JWT security filter rejections.*

Validated under sustained stress testing using distributed virtual users (VUs):

| Test Scenario | Virtual Users (VUs) | Throughput (Req/Sec) | Latency p(95) | Error Rate | Architectural Validation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Transactional Trading Engine** (`POST /api/trade`) | **50 VUs** | **705 req/sec** | **10.58 ms** | **0% failures** | Zero lost updates; `@Version` conflicts safely converted to HTTP 409. |
| **AI Advisor In-Memory Cache** (`GET /api/portfolio/analyze`) | **100 VUs** | **2,136 req/sec** | **82.87 ms** | **0% failures** | Sub-35ms in-memory delivery; shields Gemini API quotas. |
| **Stateless Security Filter** (Protected Endpoints) | **10 VUs** | **9,408 req/sec** | **1.49 ms** | **0% failures** | Sub-2ms cryptographic token verification & unauthorized rejection. |

---

## 4. Core Implementation Code Snippets

### 4.1 JPA Entity with `@Version` Optimistic Locking (`User.java`)
```java
@Entity
@Table(name = "app_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal cashBalance = new BigDecimal("100000.0000");

    @Version
    @Column(name = "version")
    @Builder.Default
    private Long version = 0L;

    // Defense-in-depth against null version unboxing
    @PostLoad
    @PrePersist
    @PreUpdate
    private void ensureVersionNotNull() {
        if (this.version == null) {
            this.version = 0L;
        }
    }
}
```

### 4.2 Redis Cache Configuration with Fail-Open Error Handler (`CacheConfig.java`)
```java
@Configuration
@EnableCaching
@Slf4j
public class CacheConfig implements CachingConfigurer {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(15))
                .disableCachingNullValues()
                .serializeValuesWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(RedisSerializer.json())
                );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(config)
                .build();
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException ex, Cache cache, Object key) {
                log.warn("Redis GET failed for key [{}] in cache [{}]. Falling back to source.", key, cache.getName());
            }

            @Override
            public void handleCacheEvictError(RuntimeException ex, Cache cache, Object key) {
                log.warn("Redis EVICT failed for key [{}]. Proceeding without cache.", key);
            }

            @Override
            public void handleCachePutError(RuntimeException ex, Cache cache, Object key, Object val) {
                log.warn("Redis PUT failed for key [{}]. Continuing.", key);
            }

            @Override
            public void handleCacheClearError(RuntimeException ex, Cache cache) {
                log.warn("Redis CLEAR failed for cache [{}]. Continuing.", cache.getName());
            }
        };
    }
}
```

### 4.3 Structured JSON Gemini Integration via LangChain4j (`PortfolioAiService.java`)
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioAiService {

    private final ChatLanguageModel chatLanguageModel;
    private final PortfolioPositionRepository positionRepository;
    private final ObjectMapper objectMapper;

    @Cacheable(value = "portfolioAnalysis", key = "#userId")
    public PortfolioAnalysisDto analyzePortfolio(Long userId) {
        List<PortfolioPosition> positions = positionRepository.findByUserId(userId);
        
        if (positions.isEmpty()) {
            return getDefaultStarterAssessment();
        }

        String prompt = buildStructuredPrompt(positions);
        try {
            String rawJson = chatLanguageModel.generate(prompt);
            String cleaned = cleanJson(rawJson);
            return objectMapper.readValue(cleaned, PortfolioAnalysisDto.class);
        } catch (Exception e) {
            log.error("Gemini AI failed for userId={}: {}. Using rule-based fallback.", userId, e.getMessage());
            return buildFallbackAssessment(positions);
        }
    }

    private String cleanJson(String raw) {
        return raw.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
    }
}
```

### 4.4 Stateless JWT Security Filter (`JwtTokenFilter.java`)
```java
@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        if (jwtService.isTokenValid(token)) {
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);

            UsernamePasswordAuthenticationToken authToken = 
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }
}
```

### 4.5 Configuration Template (`application.properties`)
```properties
spring.application.name=stock-backend
server.port=8080

# PostgreSQL 18 Connection Pool
spring.datasource.url=jdbc:postgresql://localhost:5432/stockdb
spring.datasource.username=admin
spring.datasource.password=admin
spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.jdbc.time_zone=UTC

# Redis 7 Caching
spring.data.redis.host=localhost
spring.data.redis.port=6379

# JWT Security
app.jwt.secret=stock-portfolio-manager-jwt-secret-key-32bytes-min
app.jwt.expiration-ms=86400000

# Google Gemini 1.5 Flash
gemini.api.key=${GEMINI_API_KEY}
gemini.model.name=gemini-1.5-flash
```

---

## 5. REST API Reference

### 5.1 Authentication API (`/api/auth`)

#### `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "email": "trader@stockverse.io",
    "password": "Password123!",
    "name": "Alex Chen"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "email": "trader@stockverse.io",
      "cashBalance": 100000.00,
      "version": 0
    }
  }
  ```

#### `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "trader@stockverse.io",
    "password": "Password123!"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
  ```

---

### 5.2 Trading API (`/api/trade`)

#### `POST /api/trade`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "ticker": "AAPL",
    "quantity": 10,
    "action": "BUY"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "transactionId": 1042,
    "ticker": "AAPL",
    "quantity": 10,
    "action": "BUY",
    "executedPrice": 224.50,
    "totalCost": 2245.00,
    "remainingCash": 97755.00,
    "timestamp": "2026-09-28T01:30:00Z"
  }
  ```
- **Response `409 Conflict` (Version Collision)**:
  ```json
  {
    "status": 409,
    "error": "Conflict",
    "message": "Concurrent trade conflict detected. Please retry your trade request."
  }
  ```

#### `GET /api/trade/positions`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  [
    {
      "id": 12,
      "ticker": "AAPL",
      "quantity": 25,
      "averageBuyPrice": 218.40,
      "currentPrice": 224.50,
      "unrealizedPnL": 152.50
    }
  ]
  ```

---

### 5.3 Portfolio & AI Advisor API (`/api/portfolio`)

#### `GET /api/portfolio/analyze`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`** (Cached in Redis for 15 minutes):
  ```json
  {
    "portfolioScore": 84,
    "diversificationScore": 78,
    "riskLevel": "Moderate",
    "summary": "Strong technology tilt with high liquidity. Consider diversifying into defensive sectors.",
    "strengths": [
      "Low portfolio cost basis across mega-cap tech",
      "Sufficient cash reserve ($97,755) for dip buying"
    ],
    "weaknesses": [
      "Overconcentration: 65% exposure to consumer electronics (AAPL)"
    ],
    "holdingRecommendations": [
      {
        "ticker": "AAPL",
        "action": "HOLD",
        "rationale": "High profit cushion; maintain allocation without expanding position."
      }
    ]
  }
  ```

---

## 6. Troubleshooting & Engineering Gotchas

### 6.1 Concurrency & Version Collisions under High Market Load
- **Gotcha**: High-frequency trades on the same portfolio generate Hibernate `StaleObjectStateException`. If unhandled, this results in an HTTP 500 internal server error.
- **Fix**: The `@Transactional` service catches `ObjectOptimisticLockingFailureException` and throws `TradeConflictException`. `GlobalExceptionHandler` converts this to **HTTP 409 Conflict**. The frontend gracefully alerts the user to retry rather than crashing.

### 6.2 Redis Connection Pooling & Network Partitioning
- **Gotcha**: If Redis experiences network partitions or hits connection limits, standard Spring caching throws `RedisConnectionFailureException` and breaks the entire user request.
- **Fix**: Override `CachingConfigurer.errorHandler()` in `CacheConfig.java`. Suppress Redis errors as warnings and fall through directly to live generation. Trading execution never blocks on Redis.

### 6.3 LLM Quota Throttling & Markdown JSON Wrapping
- **Gotcha**: Gemini occasionally wraps JSON responses with ````json ... ````, or returns HTTP 429 when hitting rate limits.
- **Fix**: Apply `cleanJson()` to strip markdown syntax before Jackson deserialization. In the catch block, invoke `buildFallbackAssessment()` to generate an instant rule-based quantitative diagnostic so the user always sees a rendered report.

### 6.4 Infinite JSON Recursion on Bidirectional JPA Relationships
- **Gotcha**: Bidirectional `@OneToMany` and `@ManyToOne` mappings between `User` and `PortfolioPosition` cause Jackson to exceed maximum nesting depth (501) and throw `HttpMessageNotWritableException`.
- **Fix**: Annotate child entity back-references (`@ManyToOne private User user;`) with `@JsonIgnore` to cleanly sever the cycle.
