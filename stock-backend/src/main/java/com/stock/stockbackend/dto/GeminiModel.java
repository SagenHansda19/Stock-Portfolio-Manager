package com.stock.stockbackend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;

public class GeminiModel {

    // ---------------------------------------------------------------
    // Interactions API request structure
    // POST /v1beta/interactions
    // Auth: x-goog-api-key header
    // ---------------------------------------------------------------
    public record InteractionRequest(
            String model,
            String input
    ) {}

    // ---------------------------------------------------------------
    // Interactions API response structure
    // Response text is in steps[].content[].text where type="model_output"
    // ---------------------------------------------------------------
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record InteractionResponse(
            String id,
            String status,
            List<Step> steps
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Step(
            String type,
            List<ContentPart> content
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ContentPart(
            String text,
            String type
    ) {}
}
