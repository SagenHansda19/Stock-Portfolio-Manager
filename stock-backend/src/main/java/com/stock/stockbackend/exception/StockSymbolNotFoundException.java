package com.stock.stockbackend.exception;

public class StockSymbolNotFoundException extends RuntimeException {

    public StockSymbolNotFoundException(String symbol) {
        super("No stock price found for symbol: " + symbol);
    }
}
