package com.stock.stockbackend.exception;

public class InsufficientStockQuantityException extends RuntimeException {

    public InsufficientStockQuantityException(String message) {
        super(message);
    }
}
