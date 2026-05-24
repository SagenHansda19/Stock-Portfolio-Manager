package com.stock.stockbackend.exception;

public class InvalidPortfolioSortException extends RuntimeException {

    public InvalidPortfolioSortException(String sortBy) {
        super("Unsupported portfolio sort field: " + sortBy);
    }
}
