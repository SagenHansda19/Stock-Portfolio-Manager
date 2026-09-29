package com.stock.stockbackend.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import java.time.Duration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;

@Configuration
@Slf4j
public class AiConfig {

    @Value("${gemini.api.key:${stock.api.gemini.api-key:}}")
    private String geminiApiKey;

    @Value("${gemini.model.name:gemini-1.5-flash}")
    private String modelName;

    @Bean
    @Lazy
    public ChatLanguageModel chatLanguageModel() {
        String apiKeyToUse = (geminiApiKey != null && !geminiApiKey.isBlank()) ? geminiApiKey : "mock-api-key";
        log.info("Initializing LangChain4j GoogleAiGeminiChatModel bean with modelName={}, temperature=0.2", modelName);
        return GoogleAiGeminiChatModel.builder()
                .apiKey(apiKeyToUse)
                .modelName(modelName)
                .temperature(0.2)
                .timeout(Duration.ofSeconds(60))
                .responseFormat(ResponseFormat.JSON)
                .logRequestsAndResponses(true)
                .build();
    }

    @Bean
    public com.fasterxml.jackson.databind.ObjectMapper objectMapper() {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        mapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        return mapper;
    }
}

