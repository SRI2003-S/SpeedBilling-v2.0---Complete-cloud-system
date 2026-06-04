package com.speedbilling.controller;

import com.speedbilling.dto.request.ServiceSessionRequest;
import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.dto.response.ServiceSessionResponse;
import com.speedbilling.service.AuthService;
import com.speedbilling.service.ServiceSessionService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final ServiceSessionService sessionService;
    private final AuthService authService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<ServiceSessionResponse>>> getCustomerSessions(
            @PathVariable Long customerId,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(sessionService.getCustomerSessions(customerId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceSessionResponse>> getSession(
            @PathVariable Long id,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(sessionService.getSession(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceSessionResponse>> createSession(
            @Valid @RequestBody ServiceSessionRequest request,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success("Session created", sessionService.createSession(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceSessionResponse>> updateSession(
            @PathVariable Long id,
            @Valid @RequestBody ServiceSessionRequest request,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success("Session updated", sessionService.updateSession(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSession(
            @PathVariable Long id,
            HttpSession session) {
        authService.getCurrentUser(session);
        sessionService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success("Session deleted", null));
    }
}
