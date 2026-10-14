package com.example.ems.controller;

import com.example.ems.dto.AuthResponse;
import com.example.ems.dto.LoginRequest;
import com.example.ems.dto.PasswordChangeRequest;
import com.example.ems.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PutMapping("/password")
    public Map<String, String> changePassword(
            Authentication authentication, @Valid @RequestBody PasswordChangeRequest request) {
        authService.changePassword(authentication.getName(), request);
        return Map.of("message", "Password updated.");
    }
}
