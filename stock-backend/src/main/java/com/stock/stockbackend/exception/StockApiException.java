package com.stock.stockbackend.exception;

public class StockApiException extends RuntimeException {

    public StockApiException(String message) {
        super(message);
    }

    public StockApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
