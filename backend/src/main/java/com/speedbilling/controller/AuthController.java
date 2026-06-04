package com.speedbilling.controller;

import com.speedbilling.dto.request.LoginRequest;
import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.dto.response.LoginResponse;
import com.speedbilling.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpSession session) {
        try {
            LoginResponse response = authService.login(request, session);
            // Create a simple token: userId:role:sessionId
            String token = response.getUserId() + ":" + response.getRole() + ":" + session.getId();
            response.setToken(token);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpSession session) {
        authService.logout(session);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<LoginResponse>> getSession(HttpSession session) {
        try {
            var user = authService.getCurrentUser(session);
            LoginResponse response = LoginResponse.builder()
                    .userId(user.getUserId())
                    .username(user.getUsername())
                    .role(user.getRole())
                    .build();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
    }
}
