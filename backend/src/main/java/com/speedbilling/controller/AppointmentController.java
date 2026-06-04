package com.speedbilling.controller;

import com.speedbilling.dto.request.AppointmentRequest;
import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.dto.response.AppointmentResponse;
import com.speedbilling.service.AppointmentService;
import com.speedbilling.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointments(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String start,
            @RequestParam(required = false) String end,
            @RequestParam(required = false) Long customerId,
            HttpSession session) {
        authService.getCurrentUser(session);

        if (customerId != null) {
            return ResponseEntity.ok(ApiResponse.success(
                    appointmentService.getAppointmentsByCustomer(customerId)));
        }

        if (date != null) {
            LocalDate queryDate = LocalDate.parse(date);
            return ResponseEntity.ok(ApiResponse.success(
                    appointmentService.getAppointmentsByDate(queryDate)));
        }

        if (start != null && end != null) {
            LocalDate startDate = LocalDate.parse(start);
            LocalDate endDate = LocalDate.parse(end);
            return ResponseEntity.ok(ApiResponse.success(
                    appointmentService.getAppointmentsByDateRange(startDate, endDate)));
        }

        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getAppointmentsByDate(LocalDate.now())));
    }

    @GetMapping("/calendar")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getCalendar(
            @RequestParam String start,
            @RequestParam String end,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(
                appointmentService.getAppointmentsByDateRange(
                        LocalDate.parse(start), LocalDate.parse(end))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success("Appointment created",
                appointmentService.createAppointment(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentRequest request,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success("Appointment updated",
                appointmentService.updateAppointment(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            HttpSession session) {
        authService.getCurrentUser(session);
        appointmentService.updateAppointmentStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + status, null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAppointment(
            @PathVariable Long id,
            HttpSession session) {
        authService.getCurrentUser(session);
        appointmentService.deleteAppointment(id);
        return ResponseEntity.ok(ApiResponse.success("Appointment deleted", null));
    }
}
