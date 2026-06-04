package com.speedbilling.controller;

import com.speedbilling.dto.request.CustomerRequest;
import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.dto.response.CustomerProfileResponse;
import com.speedbilling.service.AuthService;
import com.speedbilling.service.CustomerService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerProfileResponse>>> searchCustomers(
            @RequestParam(required = false) String q,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(customerService.searchCustomers(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getCustomer(
            @PathVariable Long id,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerProfile(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> createCustomer(
            @Valid @RequestBody CustomerRequest request,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success("Customer created", customerService.createCustomer(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success("Customer updated", customerService.updateCustomer(id, request)));
    }

    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getTimeline(
            @PathVariable Long id,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerTimeline(id)));
    }
}
