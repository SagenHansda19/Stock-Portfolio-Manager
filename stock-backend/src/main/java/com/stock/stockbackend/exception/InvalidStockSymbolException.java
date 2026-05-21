package com.stock.stockbackend.exception;

public class InvalidStockSymbolException extends RuntimeException {

    public InvalidStockSymbolException(String symbol) {
        super("Invalid stock symbol: " + symbol);
    }
}
