package com.stock.stockbackend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stock.stockbackend.dto.PortfolioAnalysisDto;
import com.stock.stockbackend.entity.PortfolioPosition;
import com.stock.stockbackend.repository.PortfolioPositionRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@ExtendWith(MockitoExtension.class)
class PortfolioAiServiceTest {

    @Mock
    private PortfolioPositionRepository positionRepository;

    @Mock
    private ChatLanguageModel chatLanguageModel;

    private ObjectMapper objectMapper;
    private PortfolioAiService portfolioAiService;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        portfolioAiService = new PortfolioAiService(positionRepository, chatLanguageModel, objectMapper);
    }

    @Test
    void analyzePortfolio_WhenZeroPositions_ReturnsDefaultStarterAssessmentWithoutCallingGemini() {
        Long userId = 101L;
        when(positionRepository.findByUserId(userId)).thenReturn(List.of());

        PortfolioAnalysisDto result = portfolioAiService.analyzePortfolio(userId);

        assertNotNull(result);
        assertEquals(72, result.getPortfolioScore());
        assertEquals(50, result.getDiversificationScore());
        assertEquals("Moderate", result.getRiskLevel());
        assertTrue(result.getSummary().contains("currently has no active equity positions"));
        assertFalse(result.getRecommendations().isEmpty());

        // Crucial requirement: Gemini MUST NOT be called if user has 0 positions
        verify(chatLanguageModel, never()).generate(anyString());
    }

    @Test
    void analyzePortfolio_WhenPositionsExist_CallsGeminiAndParsesJson() {
        Long userId = 202L;
        List<PortfolioPosition> positions = List.of(
                PortfolioPosition.builder()
                        .ticker("AAPL")
                        .quantity(new BigDecimal("15.0000"))
                        .averageBuyPrice(new BigDecimal("180.0000"))
                        .build(),
                PortfolioPosition.builder()
                        .ticker("NVDA")
                        .quantity(new BigDecimal("10.0000"))
                        .averageBuyPrice(new BigDecimal("420.0000"))
                        .build()
        );

        when(positionRepository.findByUserId(userId)).thenReturn(positions);

        String mockGeminiJson = """
                ```json
                {
                  "portfolioScore": 86,
                  "diversificationScore": 74,
                  "riskLevel": "Moderate",
                  "summary": "Strong technology growth exposure with healthy margin profiles.",
                  "strengths": ["World-class balance sheets", "High cash generation"],
                  "weaknesses": ["High tech sector correlation"],
                  "recommendations": [
                    {
                      "symbol": "AAPL",
                      "action": "HOLD",
                      "confidence": 92,
                      "reason": "Dominant ecosystem and robust capital returns."
                    },
                    {
                      "symbol": "NVDA",
                      "action": "HOLD",
                      "confidence": 88,
                      "reason": "Market-leading AI compute franchise with sustained gross margins."
                    }
                  ]
                }
                ```
                """;

        when(chatLanguageModel.generate(anyString())).thenReturn(mockGeminiJson);

        PortfolioAnalysisDto result = portfolioAiService.analyzePortfolio(userId);

        assertNotNull(result);
        assertEquals(86, result.getPortfolioScore());
        assertEquals(74, result.getDiversificationScore());
        assertEquals("Moderate", result.getRiskLevel());
        assertEquals(2, result.getRecommendations().size());
        assertEquals("AAPL", result.getRecommendations().get(0).getSymbol());
        assertEquals("HOLD", result.getRecommendations().get(0).getAction());

        verify(chatLanguageModel).generate(anyString());
    }

    @Test
    void analyzePortfolio_WhenGeminiFails_ReturnsGracefulFallbackAssessment() {
        Long userId = 303L;
        List<PortfolioPosition> positions = List.of(
                PortfolioPosition.builder()
                        .ticker("MSFT")
                        .quantity(new BigDecimal("20.0000"))
                        .averageBuyPrice(new BigDecimal("330.0000"))
                        .build()
        );

        when(positionRepository.findByUserId(userId)).thenReturn(positions);
        when(chatLanguageModel.generate(anyString())).thenThrow(new RuntimeException("Google Gemini quota exhausted"));

        PortfolioAnalysisDto result = portfolioAiService.analyzePortfolio(userId);

        assertNotNull(result);
        assertTrue(result.getPortfolioScore() > 0);
        assertNotNull(result.getSummary());
        assertFalse(result.getRecommendations().isEmpty());
        assertEquals("MSFT", result.getRecommendations().get(0).getSymbol());
    }

    @Test
    void portfolioAiService_HasCacheableAnnotation() throws NoSuchMethodException {
        Method method = PortfolioAiService.class.getMethod("analyzePortfolio", Long.class);
        Cacheable cacheable = method.getAnnotation(Cacheable.class);

        assertNotNull(cacheable, "analyzePortfolio method must have @Cacheable annotation");
        assertEquals("portfolioAnalysis", cacheable.value()[0]);
        assertEquals("#userId", cacheable.key());
    }

    @Test
    void tradeService_HasCacheEvictAnnotation() throws NoSuchMethodException {
        Method method = TradeService.class.getMethod("executeTrade", Long.class, String.class, int.class, String.class);
        CacheEvict cacheEvict = method.getAnnotation(CacheEvict.class);

        assertNotNull(cacheEvict, "TradeService.executeTrade must have @CacheEvict annotation");
        assertEquals("portfolioAnalysis", cacheEvict.value()[0]);
        assertEquals("#userId", cacheEvict.key());
    }
}
