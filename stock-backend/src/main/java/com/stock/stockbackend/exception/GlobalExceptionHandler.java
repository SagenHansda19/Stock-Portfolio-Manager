package com.stock.stockbackend.exception;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyExists(EmailAlreadyExistsException exception) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ApiError(
                        HttpStatus.CONFLICT.value(),
                        exception.getMessage(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentials() {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiError(
                        HttpStatus.UNAUTHORIZED.value(),
                        "Invalid email or password",
                        Instant.now()
                ));
    }

    @ExceptionHandler(PortfolioHoldingNotFoundException.class)
    public ResponseEntity<ApiError> handlePortfolioHoldingNotFound(PortfolioHoldingNotFoundException exception) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiError(
                        HttpStatus.NOT_FOUND.value(),
                        exception.getMessage(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(InsufficientStockQuantityException.class)
    public ResponseEntity<ApiError> handleInsufficientStockQuantity(InsufficientStockQuantityException exception) {
        return ResponseEntity
                .badRequest()
                .body(new ApiError(
                        HttpStatus.BAD_REQUEST.value(),
                        exception.getMessage(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(StockSymbolNotFoundException.class)
    public ResponseEntity<ApiError> handleStockSymbolNotFound(StockSymbolNotFoundException exception) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ApiError(
                        HttpStatus.NOT_FOUND.value(),
                        exception.getMessage(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(InvalidStockSymbolException.class)
    public ResponseEntity<ApiError> handleInvalidStockSymbol(InvalidStockSymbolException exception) {
        return ResponseEntity
                .badRequest()
                .body(new ApiError(
                        HttpStatus.BAD_REQUEST.value(),
                        exception.getMessage(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(StockApiRateLimitException.class)
    public ResponseEntity<ApiError> handleStockApiRateLimit(StockApiRateLimitException exception) {
        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new ApiError(
                        HttpStatus.TOO_MANY_REQUESTS.value(),
                        exception.getMessage(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(StockApiException.class)
    public ResponseEntity<ApiError> handleStockApiException(StockApiException exception) {
        return ResponseEntity
                .status(HttpStatus.BAD_GATEWAY)
                .body(new ApiError(
                        HttpStatus.BAD_GATEWAY.value(),
                        exception.getMessage(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity.badRequest().body(errors);
    }
}
