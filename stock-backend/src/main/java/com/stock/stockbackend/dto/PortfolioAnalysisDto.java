package com.stock.stockbackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PortfolioAnalysisDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer portfolioScore;
    private Integer diversificationScore;
    private String riskLevel;
    private String summary;

    @Builder.Default
    private List<String> strengths = new ArrayList<>();

    @Builder.Default
    private List<String> weaknesses = new ArrayList<>();

    @Builder.Default
    private List<StockRecommendation> recommendations = new ArrayList<>();

    @Builder.Default
    private List<String> improvements = new ArrayList<>();

    private String overallRecommendation;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StockRecommendation implements Serializable {
        private static final long serialVersionUID = 1L;
        private String symbol;
        private String action;
        private Integer confidence;
        private String reason;
    }
}
