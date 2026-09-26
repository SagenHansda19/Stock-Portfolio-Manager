package com.stock.stockbackend.service;

import com.stock.stockbackend.dto.MarketNewsDto;
import com.stock.stockbackend.dto.StockScreenerCriteriaDto;
import com.stock.stockbackend.dto.StockScreenerResultDto;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataService {

    private static final List<StockScreenerResultDto> STOCK_UNIVERSE = List.of(
            StockScreenerResultDto.builder()
                    .ticker("AAPL")
                    .companyName("Apple Inc.")
                    .sector("Technology")
                    .price(new BigDecimal("185.50"))
                    .changePercent(new BigDecimal("1.42"))
                    .volume(48500000L)
                    .marketCap(new BigDecimal("2850000000000"))
                    .peRatio(new BigDecimal("29.4"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("MSFT")
                    .companyName("Microsoft Corporation")
                    .sector("Technology")
                    .price(new BigDecimal("420.25"))
                    .changePercent(new BigDecimal("0.85"))
                    .volume(22100000L)
                    .marketCap(new BigDecimal("3120000000000"))
                    .peRatio(new BigDecimal("35.2"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("NVDA")
                    .companyName("NVIDIA Corporation")
                    .sector("Technology")
                    .price(new BigDecimal("125.40"))
                    .changePercent(new BigDecimal("3.75"))
                    .volume(65400000L)
                    .marketCap(new BigDecimal("3080000000000"))
                    .peRatio(new BigDecimal("48.6"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("GOOGL")
                    .companyName("Alphabet Inc.")
                    .sector("Communication Services")
                    .price(new BigDecimal("175.60"))
                    .changePercent(new BigDecimal("-0.45"))
                    .volume(21400000L)
                    .marketCap(new BigDecimal("2180000000000"))
                    .peRatio(new BigDecimal("24.8"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("AMZN")
                    .companyName("Amazon.com Inc.")
                    .sector("Consumer Cyclical")
                    .price(new BigDecimal("190.20"))
                    .changePercent(new BigDecimal("1.15"))
                    .volume(31200000L)
                    .marketCap(new BigDecimal("1980000000000"))
                    .peRatio(new BigDecimal("41.3"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("TSLA")
                    .companyName("Tesla Inc.")
                    .sector("Consumer Cyclical")
                    .price(new BigDecimal("245.80"))
                    .changePercent(new BigDecimal("-2.10"))
                    .volume(55800000L)
                    .marketCap(new BigDecimal("782000000000"))
                    .peRatio(new BigDecimal("62.5"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("META")
                    .companyName("Meta Platforms Inc.")
                    .sector("Communication Services")
                    .price(new BigDecimal("505.75"))
                    .changePercent(new BigDecimal("2.30"))
                    .volume(14300000L)
                    .marketCap(new BigDecimal("1280000000000"))
                    .peRatio(new BigDecimal("26.7"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("JPM")
                    .companyName("JPMorgan Chase & Co.")
                    .sector("Financial Services")
                    .price(new BigDecimal("210.40"))
                    .changePercent(new BigDecimal("0.35"))
                    .volume(9800000L)
                    .marketCap(new BigDecimal("604000000000"))
                    .peRatio(new BigDecimal("12.1"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("V")
                    .companyName("Visa Inc.")
                    .sector("Financial Services")
                    .price(new BigDecimal("275.90"))
                    .changePercent(new BigDecimal("0.55"))
                    .volume(6100000L)
                    .marketCap(new BigDecimal("565000000000"))
                    .peRatio(new BigDecimal("30.4"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("JNJ")
                    .companyName("Johnson & Johnson")
                    .sector("Healthcare")
                    .price(new BigDecimal("162.30"))
                    .changePercent(new BigDecimal("-0.20"))
                    .volume(7400000L)
                    .marketCap(new BigDecimal("390000000000"))
                    .peRatio(new BigDecimal("16.9"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("LLY")
                    .companyName("Eli Lilly and Company")
                    .sector("Healthcare")
                    .price(new BigDecimal("910.50"))
                    .changePercent(new BigDecimal("1.85"))
                    .volume(4300000L)
                    .marketCap(new BigDecimal("865000000000"))
                    .peRatio(new BigDecimal("115.2"))
                    .build(),
            StockScreenerResultDto.builder()
                    .ticker("XOM")
                    .companyName("Exxon Mobil Corporation")
                    .sector("Energy")
                    .price(new BigDecimal("118.20"))
                    .changePercent(new BigDecimal("0.90"))
                    .volume(12300000L)
                    .marketCap(new BigDecimal("468000000000"))
                    .peRatio(new BigDecimal("13.8"))
                    .build()
    );

    /**
     * Fetches market news, simulating Finnhub news API.
     * Annotated with Spring Data Redis @Cacheable to prevent rate-limiting external providers.
     */
    @Cacheable(value = "marketNews", key = "#category != null ? #category.toLowerCase() : 'general'", unless = "#result == null || #result.isEmpty()")
    public List<MarketNewsDto> getMarketNews(String category) {
        String cat = (category != null && !category.isBlank()) ? category.trim().toLowerCase(Locale.ROOT) : "general";
        log.info("Cache miss for market news category: '{}'. Generating fresh Finnhub-simulated feed.", cat);

        long now = Instant.now().getEpochSecond();

        return switch (cat) {
            case "crypto" -> List.of(
                    MarketNewsDto.builder()
                            .id(201L)
                            .category("crypto")
                            .datetime(now - 1200)
                            .headline("Institutional Inflows Propel Digital Assets Higher")
                            .summary("Major asset managers reported record weekly inflows into crypto index funds amid rising global macro interest.")
                            .source("Finnhub Crypto Desk")
                            .related("BTC,ETH,COIN")
                            .image("https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=600&auto=format&fit=crop&q=80")
                            .url("https://finnhub.io/news/crypto-201")
                            .build(),
                    MarketNewsDto.builder()
                            .id(202L)
                            .category("crypto")
                            .datetime(now - 3600)
                            .headline("Regulatory Clarity Strengthens Stablecoin Payment Rails")
                            .summary("New regulatory guidance offers clear compliance pathways for tokenized treasury yields and merchant settlement.")
                            .source("Reuters Crypto")
                            .related("COIN,HOOD")
                            .image("https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80")
                            .url("https://finnhub.io/news/crypto-202")
                            .build()
            );
            case "energy" -> List.of(
                    MarketNewsDto.builder()
                            .id(301L)
                            .category("energy")
                            .datetime(now - 1500)
                            .headline("Global Energy Demand Rebounds as Refineries Expand Throughput")
                            .summary("Crude futures stabilized as OPEC+ maintained production quotas while industrial energy demand continued climbing.")
                            .source("Bloomberg Energy")
                            .related("XOM,CVX,BP")
                            .image("https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80")
                            .url("https://finnhub.io/news/energy-301")
                            .build()
            );
            default -> List.of(
                    MarketNewsDto.builder()
                            .id(101L)
                            .category("general")
                            .datetime(now - 600)
                            .headline("Wall Street Rallies as Semiconductor & Tech Earnings Beat Expectations")
                            .summary("Broad market indices climbed after enterprise AI demand drove strong quarterly guidance across semiconductor giants.")
                            .source("Finnhub Market Wire")
                            .related("NVDA,AAPL,MSFT")
                            .image("https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80")
                            .url("https://finnhub.io/news/101")
                            .build(),
                    MarketNewsDto.builder()
                            .id(102L)
                            .category("general")
                            .datetime(now - 1800)
                            .headline("Federal Reserve Signals Cautious Rate Trajectory Amid Cool Inflation Data")
                            .summary("Treasury yields moderated following central bank remarks pointing toward steady economic expansion and balanced liquidity.")
                            .source("Wall Street Journal")
                            .related("SPY,QQQ,JPM")
                            .image("https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=80")
                            .url("https://finnhub.io/news/102")
                            .build(),
                    MarketNewsDto.builder()
                            .id(103L)
                            .category("general")
                            .datetime(now - 4200)
                            .headline("Cloud Infrastructure Capex Forecasted to Surpass $200B by Year End")
                            .summary("Hyperscalers continue ramping datacenter deployments to support accelerated generative AI workloads and enterprise migrations.")
                            .source("Reuters Business")
                            .related("AMZN,GOOGL,MSFT")
                            .image("https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80")
                            .url("https://finnhub.io/news/103")
                            .build()
            );
        };
    }

    /**
     * Stock screener that returns a filtered, sorted list of tickers based on multi-dimensional criteria.
     */
    public List<StockScreenerResultDto> screenStocks(StockScreenerCriteriaDto criteria) {
        if (criteria == null) {
            return new ArrayList<>(STOCK_UNIVERSE);
        }

        return STOCK_UNIVERSE.stream()
                .filter(stock -> {
                    // Sector filter
                    if (criteria.getSector() != null && !criteria.getSector().isBlank()) {
                        if (!stock.getSector().equalsIgnoreCase(criteria.getSector().trim())) {
                            return false;
                        }
                    }
                    // Price bounds
                    if (criteria.getMinPrice() != null && stock.getPrice().compareTo(criteria.getMinPrice()) < 0) {
                        return false;
                    }
                    if (criteria.getMaxPrice() != null && stock.getPrice().compareTo(criteria.getMaxPrice()) > 0) {
                        return false;
                    }
                    // Volume threshold
                    if (criteria.getMinVolume() != null && stock.getVolume() < criteria.getMinVolume()) {
                        return false;
                    }
                    // Change percent bounds
                    if (criteria.getMinChangePercent() != null && stock.getChangePercent().compareTo(criteria.getMinChangePercent()) < 0) {
                        return false;
                    }
                    if (criteria.getMaxChangePercent() != null && stock.getChangePercent().compareTo(criteria.getMaxChangePercent()) > 0) {
                        return false;
                    }
                    return true;
                })
                .sorted(resolveComparator(criteria.getSortBy(), criteria.getDirection()))
                .toList();
    }

    private Comparator<StockScreenerResultDto> resolveComparator(String sortBy, String direction) {
        boolean desc = direction != null && direction.equalsIgnoreCase("DESC");
        Comparator<StockScreenerResultDto> comparator;

        if (sortBy == null) {
            comparator = Comparator.comparing(StockScreenerResultDto::getMarketCap);
        } else {
            comparator = switch (sortBy.toLowerCase(Locale.ROOT)) {
                case "price" -> Comparator.comparing(StockScreenerResultDto::getPrice);
                case "volume" -> Comparator.comparing(StockScreenerResultDto::getVolume);
                case "changepercent", "change" -> Comparator.comparing(StockScreenerResultDto::getChangePercent);
                case "peratio", "pe" -> Comparator.comparing(StockScreenerResultDto::getPeRatio);
                case "ticker" -> Comparator.comparing(StockScreenerResultDto::getTicker);
                default -> Comparator.comparing(StockScreenerResultDto::getMarketCap);
            };
        }

        return desc ? comparator.reversed() : comparator;
    }
}
