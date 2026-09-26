package com.stock.stockbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.stockbackend.dto.PortfolioAnalysisDto;
import com.stock.stockbackend.entity.PortfolioPosition;
import com.stock.stockbackend.repository.PortfolioPositionRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PortfolioAiService {

    private final PortfolioPositionRepository positionRepository;
    private final ChatLanguageModel chatLanguageModel;
    private final ObjectMapper objectMapper;

    /**
     * Generates or retrieves from Redis cache a comprehensive AI portfolio evaluation for the specified user.
     *
     * @param userId The ID of the user requesting portfolio analysis
     * @return Structured PortfolioAnalysisDto assessment
     */
    @Cacheable(value = "portfolioAnalysis", key = "#userId")
    public PortfolioAnalysisDto analyzePortfolio(Long userId) {
        log.info("Computing AI Portfolio Analysis for userId={}", userId);

        List<PortfolioPosition> positions = positionRepository.findByUserId(userId);

        if (positions == null || positions.isEmpty()) {
            log.info("UserId={} has 0 active positions. Returning default starter assessment without calling Gemini.", userId);
            return getDefaultStarterAssessment();
        }

        String prompt = buildPrompt(positions);
        log.debug("Generated structured Gemini prompt for userId={}: {}", userId, prompt);

        try {
            String rawResponse = chatLanguageModel.generate(prompt);
            log.debug("Received raw response from Gemini: {}", rawResponse);

            String cleanedJson = cleanJson(rawResponse);
            PortfolioAnalysisDto analysis = objectMapper.readValue(cleanedJson, PortfolioAnalysisDto.class);

            // Populate fallback fields if missing
            if (analysis.getImprovements() == null || analysis.getImprovements().isEmpty()) {
                analysis.setImprovements(List.of(
                        "Rebalance weighting towards high-conviction holdings",
                        "Maintain liquid capital reserves for volatility opportunities"
                ));
            }
            if (analysis.getOverallRecommendation() == null || analysis.getOverallRecommendation().isBlank()) {
                analysis.setOverallRecommendation(analysis.getSummary());
            }

            return analysis;
        } catch (Exception e) {
            log.error("Gemini AI generation or JSON parsing failed for userId={}: {}", userId, e.getMessage(), e);
            return buildFallbackAssessment(positions);
        }
    }

    private String buildPrompt(List<PortfolioPosition> positions) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert quantitative portfolio manager and AI Investment Advisor.\n");
        prompt.append("Analyze the following investor portfolio holdings:\n\n");

        for (int i = 0; i < positions.size(); i++) {
            PortfolioPosition pos = positions.get(i);
            prompt.append(String.format("%d. Ticker: %s | Quantity: %s shares | Average Buy Price: $%s\n",
                    i + 1,
                    pos.getTicker(),
                    pos.getQuantity() != null ? pos.getQuantity().toPlainString() : "0",
                    pos.getAverageBuyPrice() != null ? pos.getAverageBuyPrice().toPlainString() : "0.00"
            ));
        }

        prompt.append("\nRequirements:\n");
        prompt.append("1. Compute portfolioScore (integer 0-100), diversificationScore (integer 0-100), and riskLevel ('Low', 'Moderate', or 'High').\n");
        prompt.append("2. Provide an executive summary, list of 2-4 strengths, list of 2-4 weaknesses, and specific recommendations for each holding (symbol, action: 'HOLD'|'REVIEW'|'REDUCE'|'CONSIDER BUYING', confidence: 0-100, reason).\n");
        prompt.append("3. Return ONLY a valid, parseable JSON object matching this schema without markdown code blocks:\n");
        prompt.append("{\n");
        prompt.append("  \"portfolioScore\": 84,\n");
        prompt.append("  \"diversificationScore\": 72,\n");
        prompt.append("  \"riskLevel\": \"Moderate\",\n");
        prompt.append("  \"summary\": \"Executive analysis summary...\",\n");
        prompt.append("  \"strengths\": [\"Strength 1\", \"Strength 2\"],\n");
        prompt.append("  \"weaknesses\": [\"Weakness 1\", \"Weakness 2\"],\n");
        prompt.append("  \"recommendations\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"symbol\": \"AAPL\",\n");
        prompt.append("      \"action\": \"HOLD\",\n");
        prompt.append("      \"confidence\": 88,\n");
        prompt.append("      \"reason\": \"Robust operational cash flow and defensive consumer franchise.\"\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"improvements\": [\"Improvement 1\", \"Improvement 2\"],\n");
        prompt.append("  \"overallRecommendation\": \"Overall strategic direction...\"\n");
        prompt.append("}\n");

        return prompt.toString();
    }

    private PortfolioAnalysisDto getDefaultStarterAssessment() {
        return PortfolioAnalysisDto.builder()
                .portfolioScore(72)
                .diversificationScore(50)
                .riskLevel("Moderate")
                .summary("Your portfolio currently has no active equity positions. To receive personalized AI insights and risk analysis, start by acquiring your first equities across diversified market sectors.")
                .strengths(List.of(
                        "Full liquidity available in cash reserves ready for strategic capital deployment",
                        "Clean portfolio foundation with zero equity concentration risk or downside drawdown"
                ))
                .weaknesses(List.of(
                        "Absence of equity participation limits long-term compounding growth",
                        "Unallocated cash holdings face real purchasing power erosion from inflation"
                ))
                .recommendations(List.of(
                        PortfolioAnalysisDto.StockRecommendation.builder()
                                .symbol("SPY")
                                .action("CONSIDER BUYING")
                                .confidence(90)
                                .reason("Broad-market S&P 500 ETF provides core diversified exposure to 500 leading US enterprises.")
                                .build(),
                        PortfolioAnalysisDto.StockRecommendation.builder()
                                .symbol("AAPL")
                                .action("CONSIDER BUYING")
                                .confidence(85)
                                .reason("Blue-chip tech anchor with consistent free cash flow and proven capital return programs.")
                                .build()
                ))
                .improvements(List.of(
                        "Build a diversified foundation across Technology, Financials, and Healthcare",
                        "Dollar-cost average initial position sizes to mitigate timing risk"
                ))
                .overallRecommendation("Initiate your investment journey with foundational index ETFs or large-cap equities to start compounding capital.")
                .build();
    }

    private PortfolioAnalysisDto buildFallbackAssessment(List<PortfolioPosition> positions) {
        int holdingCount = positions.size();
        int diversificationScore = Math.min(95, Math.max(35, holdingCount * 18));
        int portfolioScore = Math.min(92, Math.max(55, 60 + holdingCount * 6));
        String risk = holdingCount <= 2 ? "High" : (holdingCount <= 4 ? "Moderate" : "Low");

        List<PortfolioAnalysisDto.StockRecommendation> recs = new ArrayList<>();
        for (PortfolioPosition pos : positions) {
            recs.add(PortfolioAnalysisDto.StockRecommendation.builder()
                    .symbol(pos.getTicker())
                    .action("HOLD")
                    .confidence(80)
                    .reason(String.format("Core position of %s shares at $%s avg price. Maintain position while monitoring quarterly metrics.",
                            pos.getQuantity() != null ? pos.getQuantity().toPlainString() : "0",
                            pos.getAverageBuyPrice() != null ? pos.getAverageBuyPrice().toPlainString() : "0.00"))
                    .build());
        }

        return PortfolioAnalysisDto.builder()
                .portfolioScore(portfolioScore)
                .diversificationScore(diversificationScore)
                .riskLevel(risk)
                .summary(String.format("Portfolio comprises %d active position%s. Overall allocation exhibits %s risk with opportunities for further sector expansion.",
                        holdingCount, holdingCount == 1 ? "" : "s", risk.toLowerCase()))
                .strengths(List.of(
                        String.format("Active exposure across %d established public equit%s", holdingCount, holdingCount == 1 ? "y" : "ies"),
                        "Disciplined holding structure with tracked average purchase valuations"
                ))
                .weaknesses(List.of(
                        holdingCount < 3 ? "Concentration risk elevated due to limited unique assets" : "Potential sector correlation across holdings",
                        "Periodic rebalancing recommended to maintain target asset weightings"
                ))
                .recommendations(recs)
                .improvements(List.of(
                        "Evaluate correlation coefficients between current holdings",
                        "Establish stop-loss thresholds or target profit objectives"
                ))
                .overallRecommendation("Continue systematic portfolio monitoring and diversify into complementary defensive sectors.")
                .build();
    }

    private String cleanJson(String raw) {
        if (raw == null) return "{}";
        String trimmed = raw.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }
}
