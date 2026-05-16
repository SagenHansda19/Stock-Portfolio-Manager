package com.stock.stockbackend.dto;

import com.stock.stockbackend.enums.Role;

public record AuthResponse(
        String token,
        String tokenType,
        String email,
        Role role
) {
}
