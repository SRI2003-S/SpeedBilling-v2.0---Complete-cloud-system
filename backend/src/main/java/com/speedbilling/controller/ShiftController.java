package com.speedbilling.controller;

import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.entity.ShiftManagement;
import com.speedbilling.service.AuthService;
import com.speedbilling.service.ShiftService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shifts")
@RequiredArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;
    private final AuthService authService;

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<ShiftManagement>> startShift(
            @RequestBody Map<String, BigDecimal> body,
            HttpSession session) {
        var user = authService.getCurrentUser(session);
        BigDecimal openingCash = body.getOrDefault("openingCash", BigDecimal.ZERO);
        return ResponseEntity.ok(ApiResponse.success("Shift started",
                shiftService.startShift(user.getUserId(), openingCash)));
    }

    @PostMapping("/close")
    public ResponseEntity<ApiResponse<ShiftManagement>> closeShift(
            @RequestBody Map<String, BigDecimal> body,
            HttpSession session) {
        var user = authService.getCurrentUser(session);
        BigDecimal finalCash = body.get("finalCash");
        return ResponseEntity.ok(ApiResponse.success("Shift closed",
                shiftService.closeShift(user.getUserId(), finalCash)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<ShiftManagement>> getActiveShift(HttpSession session) {
        var user = authService.getCurrentUser(session);
        ShiftManagement shift = shiftService.getActiveShift(user.getUserId());
        if (shift == null) {
            return ResponseEntity.ok(ApiResponse.error("No active shift"));
        }
        return ResponseEntity.ok(ApiResponse.success(shift));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShiftManagement>>> getAllShifts(HttpSession session) {
        authService.requireAdmin(session);
        return ResponseEntity.ok(ApiResponse.success(shiftService.getAllShifts()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShiftManagement>> getShift(
            @PathVariable Long id,
            HttpSession session) {
        authService.requireAdmin(session);
        return ResponseEntity.ok(ApiResponse.success(shiftService.getShift(id)));
    }
}
