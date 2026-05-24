package com.stock.stockbackend.controller;

import com.stock.stockbackend.dto.PortfolioHoldingResponse;
import com.stock.stockbackend.dto.PortfolioTradeRequest;
import com.stock.stockbackend.dto.PortfolioValuationResponse;
import com.stock.stockbackend.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @PostMapping("/buy")
    public ResponseEntity<PortfolioHoldingResponse> buyStock(
            @Valid @RequestBody PortfolioTradeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(portfolioService.buyStock(authentication.getName(), request));
    }

    @PostMapping("/sell")
    public ResponseEntity<PortfolioHoldingResponse> sellStock(
            @Valid @RequestBody PortfolioTradeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(portfolioService.sellStock(authentication.getName(), request));
    }

    @GetMapping
    public ResponseEntity<PortfolioValuationResponse> getPortfolio(
            @RequestParam(required = false) String symbol,
            @PageableDefault(size = 10, sort = "symbol", direction = Sort.Direction.ASC) Pageable pageable,
            Authentication authentication
    ) {
        return ResponseEntity.ok(portfolioService.getPortfolio(authentication.getName(), symbol, pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeHolding(
            @PathVariable Long id,
            Authentication authentication
    ) {
        portfolioService.removeHolding(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
