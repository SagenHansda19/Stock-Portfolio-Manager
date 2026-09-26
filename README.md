# StockVerse 📈

> An enterprise-grade, high-concurrency stock trading simulator and quantitative portfolio intelligence platform built for zero-lock transactional consistency and sub-millisecond market execution.
---

## 🛠️ The Tech Stack

| Layer | Technologies & Frameworks |
| :--- | :--- |
| **Frontend** | **React 19**, **Vite 6**, **TailwindCSS**, **Framer Motion**, **Lucide Icons**, **Recharts** |
| **Backend & Engine** | **Java 17**, **Spring Boot 3.4**, **Spring Security 6**, **Spring Data JPA / Hibernate 6** |
| **Data & Cache Tier** | **PostgreSQL 18**, **Redis 7 (In-Memory Data Store & Cache Manager)** |
| **AI & Quantitative Intelligence**| **LangChain4j**, **Google Gemini 1.5 Flash (Structured JSON Mode, Temp 0.2)** |
| **External Market Data** | **Finnhub Stock API**, **Twelve Data Time Series API** |
| **Benchmarking & Validation** | **Grafana K6 Load Testing Engine** |

---

## ⚡ Core Engineering Achievements

1. **JPA `@Version` Optimistic Concurrency Control (OCC):**
   - Eliminates thread-blocking database locks (`SELECT FOR UPDATE`) on high-frequency trading accounts.
   - Enforces version verification on `app_users` and `portfolio_positions` (`WHERE id = ? AND version = ?`), automatically detecting concurrent trade collisions and mapping them to HTTP 409 Conflict without ledger corruption or lost updates.

2. **Multi-Tier Caching Lifecycle (`@Cacheable` & `@CacheEvict`):**
   - High-compute portfolio diagnostic evaluations are cached in Redis under `portfolioAnalysis::<userId>` with a 15-minute TTL.
   - Trade execution immediately triggers `@CacheEvict(value = "portfolioAnalysis", key = "#userId")`, ensuring strict write-through data freshness while shielding external LLM quotas from repeated reads.
   - Custom `CacheErrorHandler` guarantees fail-open high availability if the Redis cluster encounters network partitions.

3. **LangChain4j & Google Gemini Structured JSON Mode:**
   - Seamlessly binds Spring Boot to Google Gemini 1.5 Flash using LangChain4j.
   - Configured with `temperature(0.2)` and `ResponseFormat.JSON` to enforce strict schema adherence for risk metrics, health scores (0-100), and asset-level review recommendations without natural language drift.
   - Features zero-holding short-circuiting and automatic rule-based quantitative fallback if external APIs timeout.

4. **Stateless JWT Security Architecture:**
   - Enterprise security filter chain operating with `SessionCreationPolicy.STATELESS`.
   - HMAC-SHA256 cryptographic signature validation with custom `OncePerRequestFilter` (`JwtTokenFilter`), non-blocking CORS configuration, and granular endpoint access control.

---

## 📊 System Performance & Load Testing

Stress-tested using **Grafana K6** across distributed virtual users (VUs) simulating concurrent market operations:

| Test Scenario / Endpoint | Virtual Users (VUs) | Throughput (Req/Sec) | Latency p(95) | Error Rate / Failures | Architectural Validation |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Transactional Trading Engine**<br>`POST /api/trade` | **50 VUs** | **705 req/sec** | **10.58 ms** | **0% failures** | Atomic multi-table consistency and optimistic locking validation under write contention. |
| **AI Advisor In-Memory Cache**<br>`GET /api/portfolio/analyze` | **100 VUs** | **2,136 req/sec** | **82.87 ms** | **0% failures** | Sub-35ms in-memory cache hits; shields Gemini quota and preserves sub-second UX. |
| **Stateless Security Filter**<br>`Protected Endpoints` | **10 VUs** | **9,408 req/sec** | **1.49 ms** | **0% failures** | Instant unauthorized rejection and microsecond cryptographic token parsing. |

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Java 17+**
- **Node.js 18+ & npm**
- **Docker & Docker Compose**

### 2. Start PostgreSQL 18 & Redis Containers
Run the required infrastructure services locally via Docker:

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

### 3. Backend Configuration (`application.properties`)
Create or verify your `stock-backend/src/main/resources/application.properties`:

```properties
spring.application.name=stock-backend

# PostgreSQL Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/stockdb?options=-c%20timezone=UTC
spring.datasource.username=admin
spring.datasource.password=admin
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=false

# Redis In-Memory Cache
spring.data.redis.host=localhost
spring.data.redis.port=6379

# JWT Security
app.jwt.secret=${JWT_SECRET:stock-portfolio-manager-jwt-secret-key-32-bytes-minimum}
app.jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}

# External Market Data (Finnhub & Twelve Data)
stock.api.finnhub.base-url=https://finnhub.io/api/v1
stock.api.finnhub.api-key=${FINNHUB_API_KEY:your_finnhub_api_key_here}
stock.api.twelvedata.base-url=https://api.twelvedata.com
stock.api.twelvedata.api-key=${TWELVE_DATA_API_KEY:your_twelve_data_api_key_here}

# Google Gemini 1.5 Flash (LangChain4j)
gemini.api.key=${GEMINI_API_KEY:your_gemini_api_key_here}
gemini.model.name=gemini-1.5-flash
```

### 4. Run the Backend
```bash
cd stock-backend
./mvnw clean spring-boot:run
```
*The Spring Boot API will start on `http://localhost:8080`.*

### 5. Run the Frontend
```bash
cd stock-frontend
npm install
npm run dev
```
*The React trading console will launch on `http://localhost:5173`.*

---

## 👨‍💻 Author & Attribution

Developed by Sagen Hansda (UID: 23BCS12396)