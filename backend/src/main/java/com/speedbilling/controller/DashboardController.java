package com.speedbilling.controller;

import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.dto.response.DashboardWidgetResponse;
import com.speedbilling.service.AuthService;
import com.speedbilling.service.DashboardService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AuthService authService;

    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<DashboardWidgetResponse>> getOwnerDashboard(
            HttpSession session) {
        authService.requireAdmin(session);
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getOwnerDashboard()));
    }

    @GetMapping("/cashier")
    public ResponseEntity<ApiResponse<?>> getCashierDashboard(HttpSession session) {
        var user = authService.getCurrentUser(session);
        // Return basic stats for cashier
        return ResponseEntity.ok(ApiResponse.success("Dashboard data", null));
    }
}
