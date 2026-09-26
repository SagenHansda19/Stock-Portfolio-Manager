package com.stock.stockbackend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class TradeConflictException extends RuntimeException {

    public TradeConflictException(String message) {
        super(message);
    }

    public TradeConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
