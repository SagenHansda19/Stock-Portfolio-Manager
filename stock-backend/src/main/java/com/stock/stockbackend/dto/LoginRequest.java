package com.stock.stockbackend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @Email
        @NotBlank
        @Size(max = 150)
        String email,

        @NotBlank
        @Size(max = 72)
        String password
) {
}
