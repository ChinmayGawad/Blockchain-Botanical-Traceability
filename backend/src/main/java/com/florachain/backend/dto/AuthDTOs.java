package com.florachain.backend.dto;

import com.florachain.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.List;

public class AuthDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 128, message = "Email must not exceed 128 characters")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(max = 128, message = "Password must not exceed 128 characters")
        private String password;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        @Size(max = 128, message = "Email must not exceed 128 characters")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 128, message = "Password must be between 6 and 128 characters")
        private String password;

        @NotNull(message = "Role is required")
        private UserRole role;

        @Size(max = 150, message = "Organisation must not exceed 150 characters")
        private String organization;

        @Size(max = 150, message = "Location must not exceed 150 characters")
        private String location;

        private List<String> certifications;

        @Size(max = 512, message = "Avatar URL must not exceed 512 characters")
        private String avatarUrl;

        @Pattern(regexp = "^$|^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$", message = "Invalid Aadhaar Number format")
        private String aadhaarNumber;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String tokenType;
        private UserDto user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private String role;
        private String organization;
        private String location;
        private String status;
        private String joinedDate;
        private List<String> certifications;
        private String avatarUrl;
        private String walletAddress;
        private String aadhaarNumber;
    }
}
