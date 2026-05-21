package com.stock.stockbackend.exception;

public class StockApiRateLimitException extends RuntimeException {

    public StockApiRateLimitException(String message) {
        super(message);
    }
}
