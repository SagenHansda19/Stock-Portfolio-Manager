package com.stock.stockbackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiAdvisorResponse(
        int portfolioScore,
        String riskLevel,
        int diversificationScore,
        String summary,
        List<String> strengths,
        List<String> weaknesses,
        List<StockRecommendation> recommendations,
        List<String> improvements,
        String overallRecommendation
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StockRecommendation(
            String symbol,
            String action, // HOLD / REVIEW / REDUCE / CONSIDER BUYING MORE
            int confidence, // 0-100
            String reason
    ) {}
}
