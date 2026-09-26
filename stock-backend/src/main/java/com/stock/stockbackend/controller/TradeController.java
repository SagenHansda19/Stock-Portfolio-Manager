package com.stock.stockbackend.controller;

import com.stock.stockbackend.dto.TradeRequest;
import com.stock.stockbackend.dto.TradeResponse;
import com.stock.stockbackend.entity.PortfolioPosition;
import com.stock.stockbackend.entity.TradeTransaction;
import com.stock.stockbackend.entity.User;
import com.stock.stockbackend.repository.UserRepository;
import com.stock.stockbackend.service.TradeService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
public class TradeController {

    private final TradeService tradeService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<TradeResponse> executeTrade(
            @Valid @RequestBody TradeRequest request,
            Authentication authentication
    ) {
        User user = getUserFromAuth(authentication);
        TradeResponse response = tradeService.executeTrade(
                user.getId(),
                request.getTicker(),
                request.getQuantity(),
                request.getAction()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/execute")
    public ResponseEntity<TradeResponse> executeTradeWithExplicitUser(
            @RequestParam(required = false) Long userId,
            @Valid @RequestBody TradeRequest request,
            Authentication authentication
    ) {
        Long targetUserId = (userId != null) ? userId : getUserFromAuth(authentication).getId();
        TradeResponse response = tradeService.executeTrade(
                targetUserId,
                request.getTicker(),
                request.getQuantity(),
                request.getAction()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/positions")
    public ResponseEntity<List<PortfolioPosition>> getPositions(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        return ResponseEntity.ok(tradeService.getUserPositions(user.getId()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<TradeTransaction>> getHistory(Authentication authentication) {
        User user = getUserFromAuth(authentication);
        return ResponseEntity.ok(tradeService.getUserTransactions(user.getId()));
    }

    @GetMapping("/price/{ticker}")
    public ResponseEntity<Map<String, Object>> getLivePrice(@PathVariable String ticker) {
        BigDecimal price = tradeService.getLiveOrMockPrice(ticker);
        return ResponseEntity.ok(Map.of(
                "ticker", ticker.toUpperCase(),
                "price", price
        ));
    }

    private User getUserFromAuth(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("Authentication required to execute trade");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found for authenticated principal: " + authentication.getName()));
    }
}
