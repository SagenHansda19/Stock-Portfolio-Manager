package com.stock.stockbackend.exception;

public class PortfolioHoldingNotFoundException extends RuntimeException {

    public PortfolioHoldingNotFoundException(String message) {
        super(message);
    }
}
