package com.stock.stockbackend.controller;

import com.stock.stockbackend.dto.PortfolioAnalysisDto;
import com.stock.stockbackend.entity.User;
import com.stock.stockbackend.repository.UserRepository;
import com.stock.stockbackend.service.PortfolioAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
@Slf4j
public class AiAdvisorController {

    private final PortfolioAiService portfolioAiService;
    private final UserRepository userRepository;

    /**
     * Secured endpoint returning AI Portfolio Analysis for the authenticated user.
     * Cached via Redis under 'portfolioAnalysis' key.
     *
     * @param userId         Optional explicit userId (defaults to authenticated principal)
     * @param authentication Current SecurityContext authentication
     * @return PortfolioAnalysisDto with health score, risk grade, and stock recommendations
     */
    @GetMapping("/analyze")
    public ResponseEntity<PortfolioAnalysisDto> getAiAnalysis(
            @RequestParam(required = false) Long userId,
            Authentication authentication
    ) {
        Long targetUserId = userId;

        if (targetUserId == null) {
            Authentication auth = (authentication != null) ? authentication : SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                throw new IllegalArgumentException("Authentication required to access AI advisor");
            }
            User user = userRepository.findByEmail(auth.getName())
                    .orElseThrow(() -> new IllegalArgumentException("User not found for authenticated email: " + auth.getName()));
            targetUserId = user.getId();
        }

        log.info("Handling GET /api/portfolio/analyze for targetUserId={}", targetUserId);
        PortfolioAnalysisDto analysis = portfolioAiService.analyzePortfolio(targetUserId);
        return ResponseEntity.ok(analysis);
    }
}
