package com.stock.stockbackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.stockbackend.dto.AiAdvisorResponse;
import com.stock.stockbackend.dto.GeminiModel;
import com.stock.stockbackend.entity.Portfolio;
import com.stock.stockbackend.entity.StockPrice;
import com.stock.stockbackend.entity.User;
import com.stock.stockbackend.exception.StockApiException;
import com.stock.stockbackend.repository.PortfolioRepository;
import com.stock.stockbackend.repository.StockPriceRepository;
import com.stock.stockbackend.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAdvisorService {

    private final RestClient geminiRestClient;
    private final PortfolioRepository portfolioRepository;
    private final StockPriceRepository stockPriceRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${stock.api.gemini.api-key}")
    private String geminiApiKey;

    @Value("${stock.api.gemini.base-url}")
    private String geminiBaseUrl;

    @Transactional(readOnly = true)
    public AiAdvisorResponse analyzePortfolio(String userEmail) {
        log.info("Starting AI Portfolio Analysis for userEmail={}", userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        List<Portfolio> activeHoldings = portfolioRepository.findAllByUserEmailAndActiveTrueOrderByStockSymbolAsc(userEmail);

        if (activeHoldings.isEmpty()) {
            throw new StockApiException("Your portfolio is empty. Buy some stocks first to generate an AI analysis.");
        }

        // Fetch current stock prices
        List<String> symbols = activeHoldings.stream().map(Portfolio::getStockSymbol).toList();
        Map<String, BigDecimal> currentPrices = stockPriceRepository.findByStockSymbolIn(symbols)
                .stream()
                .collect(Collectors.toMap(
                        StockPrice::getStockSymbol,
                        StockPrice::getPrice,
                        (existing, replacement) -> replacement
                ));

        // Calculate total portfolio value (holdings + cash)
        BigDecimal totalHoldingsValue = BigDecimal.ZERO;
        for (Portfolio holding : activeHoldings) {
            BigDecimal currentPrice = currentPrices.getOrDefault(holding.getStockSymbol(), holding.getAverageBuyPrice());
            totalHoldingsValue = totalHoldingsValue.add(holding.getQuantity().multiply(currentPrice));
        }

        BigDecimal totalPortfolioValue = totalHoldingsValue.add(user.getCashBalance());

        // Build the prompt context
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("You are an expert AI Portfolio Advisor. Analyze the following user stock portfolio and return a professional investment analysis report in raw JSON format.\n\n");
        promptBuilder.append("Portfolio Summary:\n");
        promptBuilder.append("- Total Portfolio Value: $").append(totalPortfolioValue.setScale(2, RoundingMode.HALF_UP)).append("\n");
        promptBuilder.append("- Cash Balance: $").append(user.getCashBalance().setScale(2, RoundingMode.HALF_UP)).append("\n");
        promptBuilder.append("- Total Value of Stock Holdings: $").append(totalHoldingsValue.setScale(2, RoundingMode.HALF_UP)).append("\n\n");
        promptBuilder.append("Holdings List:\n");

        for (int i = 0; i < activeHoldings.size(); i++) {
            Portfolio holding = activeHoldings.get(i);
            BigDecimal currentPrice = currentPrices.getOrDefault(holding.getStockSymbol(), holding.getAverageBuyPrice());
            BigDecimal holdingValue = holding.getQuantity().multiply(currentPrice);
            BigDecimal totalInvested = holding.getQuantity().multiply(holding.getAverageBuyPrice());
            BigDecimal profitLoss = holdingValue.subtract(totalInvested);
            BigDecimal allocationPercent = totalPortfolioValue.compareTo(BigDecimal.ZERO) > 0
                    ? holdingValue.multiply(new BigDecimal("100")).divide(totalPortfolioValue, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            promptBuilder.append(i + 1).append(". ")
                    .append("Symbol: ").append(holding.getStockSymbol()).append(", ")
                    .append("Quantity: ").append(holding.getQuantity()).append(", ")
                    .append("Avg Buy Price: $").append(holding.getAverageBuyPrice().setScale(2, RoundingMode.HALF_UP)).append(", ")
                    .append("Current Price: $").append(currentPrice.setScale(2, RoundingMode.HALF_UP)).append(", ")
                    .append("Total Value: $").append(holdingValue.setScale(2, RoundingMode.HALF_UP)).append(", ")
                    .append("Profit/Loss: $").append(profitLoss.setScale(2, RoundingMode.HALF_UP)).append(", ")
                    .append("Allocation: ").append(allocationPercent).append("%, ")
                    .append("Sector: ").append(getStockSector(holding.getStockSymbol())).append("\n");
        }

        promptBuilder.append("\nRequirements:\n");
        promptBuilder.append("1. Analyze the risk level, diversification, strengths, weaknesses, and individual asset recommendations.\n");
        promptBuilder.append("2. Return your output STRICTLY matching the JSON schema below.\n");
        promptBuilder.append("3. Do not wrap the JSON output inside markdown backticks (e.g. ```json ... ```). Return ONLY the raw valid JSON string.\n");
        promptBuilder.append("4. Be objective, realistic, and use professional investment standards.\n\n");
        promptBuilder.append("Schema:\n");
        promptBuilder.append("{\n");
        promptBuilder.append("  \"portfolioScore\": 84, // integer score 0-100\n");
        promptBuilder.append("  \"riskLevel\": \"Low\" | \"Moderate\" | \"High\",\n");
        promptBuilder.append("  \"diversificationScore\": 71, // integer score 0-100\n");
        promptBuilder.append("  \"summary\": \"Overall summary of the portfolio analysis.\",\n");
        promptBuilder.append("  \"strengths\": [\"Strength 1\", \"Strength 2\"],\n");
        promptBuilder.append("  \"weaknesses\": [\"Weakness 1\", \"Weakness 2\"],\n");
        promptBuilder.append("  \"recommendations\": [\n");
        promptBuilder.append("    {\n");
        promptBuilder.append("      \"symbol\": \"AAPL\",\n");
        promptBuilder.append("      \"action\": \"HOLD\" | \"REVIEW\" | \"REDUCE\" | \"CONSIDER BUYING MORE\",\n");
        promptBuilder.append("      \"confidence\": 92, // integer confidence score 0-100\n");
        promptBuilder.append("      \"reason\": \"Specific reason for the action.\"\n");
        promptBuilder.append("    }\n");
        promptBuilder.append("  ],\n");
        promptBuilder.append("  \"improvements\": [\"Improvement suggestions 1\", \"Improvement suggestions 2\"],\n");
        promptBuilder.append("  \"overallRecommendation\": \"Overall improvement summary recommendation.\"\n");
        promptBuilder.append("}\n");

        String prompt = promptBuilder.toString();
        log.debug("Built prompt for Gemini API: {}", prompt);

        // Prepare the request payload — Interactions API: no generation_config, model in body
        // Instruct JSON output via prompt since response_mime_type is not supported on this endpoint
        GeminiModel.InteractionRequest requestBody = new GeminiModel.InteractionRequest(
                "gemini-2.5-flash",
                prompt
        );

        log.info("Sending request to Google Gemini API (Interactions endpoint)...");
        try {
            // Read as raw String to bypass Gemini's application/octet-stream content-type header
            URI endpointUri = URI.create(geminiBaseUrl + "/v1beta/interactions");
            String rawResponseBody = geminiRestClient.post()
                    .uri(endpointUri)
                    .header("x-goog-api-key", geminiApiKey)
                    .body(requestBody)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, clientResponse) -> {
                        String errorBody = new String(clientResponse.getBody().readAllBytes());
                        log.error("Gemini API call failed with status={} body={}", clientResponse.getStatusCode(), errorBody);
                        throw new StockApiException("Google Gemini API error: " + clientResponse.getStatusCode() + " - " + errorBody);
                    })
                    .body(String.class);

            if (rawResponseBody == null || rawResponseBody.isBlank()) {
                throw new StockApiException("Received empty response body from Google Gemini Advisor");
            }

            log.debug("Raw Gemini response body: {}", rawResponseBody);

            // Parse the full response body into the DTO
            GeminiModel.InteractionResponse response = objectMapper.readValue(rawResponseBody, GeminiModel.InteractionResponse.class);

            if (response.steps() == null || response.steps().isEmpty()) {
                throw new StockApiException("Received empty steps in Google Gemini response");
            }

            // Find the model_output step (last step with content)
            String rawJson = response.steps().stream()
                    .filter(step -> "model_output".equals(step.type())
                            && step.content() != null
                            && !step.content().isEmpty())
                    .reduce((first, second) -> second) // take last model_output step
                    .map(step -> step.content().get(0).text())
                    .orElse(null);

            if (rawJson == null || rawJson.isBlank()) {
                throw new StockApiException("Received empty model output from Google Gemini Advisor");
            }

            log.debug("Extracted raw JSON from Gemini steps: {}", rawJson);

            // Clean markdown wrappers if Gemini wraps in ```json ... ```
            rawJson = cleanJsonString(rawJson);

            // Parse and validate using Jackson
            return objectMapper.readValue(rawJson, AiAdvisorResponse.class);

        } catch (Exception e) {
            log.error("AI Portfolio Analysis request or parsing failed", e);
            if (e instanceof StockApiException) {
                throw (StockApiException) e;
            }
            throw new StockApiException("AI Portfolio analysis is currently unavailable: " + e.getMessage(), e);
        }
    }

    private String getStockSector(String symbol) {
        if (symbol == null) return "Other";
        return switch (symbol.toUpperCase()) {
            case "AAPL", "MSFT", "GOOG", "GOOGL", "NVDA", "META", "AMD", "NFLX", "INTC", "CSCO" -> "Technology & Communication";
            case "TSLA", "AMZN", "HD", "NKE", "SBUX", "F", "GM" -> "Consumer Discretionary";
            case "JNJ", "PFE", "UNH", "ABBV", "MRK", "LLY" -> "Healthcare";
            case "JPM", "BAC", "WFC", "GS", "MS", "V", "MA", "AXP" -> "Financials";
            case "XOM", "CVX", "COP", "SLB" -> "Energy";
            case "WMT", "COST", "PG", "KO", "PEP", "EL" -> "Consumer Staples";
            case "DIS", "CMCSA", "T", "VZ" -> "Entertainment & Telecom";
            default -> "Other / Miscellaneous";
        };
    }

    private String cleanJsonString(String rawJson) {
        if (rawJson == null) return "";
        String trimmed = rawJson.trim();
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
