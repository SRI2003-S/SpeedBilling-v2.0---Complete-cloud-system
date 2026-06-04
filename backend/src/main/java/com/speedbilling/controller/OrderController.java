package com.speedbilling.controller;

import com.speedbilling.dto.request.CreateOrderRequest;
import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.dto.response.OrderResponse;
import com.speedbilling.service.AuthService;
import com.speedbilling.service.OrderService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            HttpSession session) {
        var user = authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success("Order created",
                orderService.createOrder(request, user.getUserId())));
    }

    @GetMapping("/{invoiceNo}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @PathVariable String invoiceNo,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderByInvoiceNo(invoiceNo)));
    }

    @PostMapping("/active/save")
    public ResponseEntity<ApiResponse<Void>> saveActiveBill(
            @RequestBody Map<String, String> body,
            HttpSession session) {
        var user = authService.getCurrentUser(session);
        orderService.saveActiveBill(user.getUserId(), body.get("billsData"));
        return ResponseEntity.ok(ApiResponse.success("Active bill saved", null));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<String>> getActiveBills(HttpSession session) {
        var user = authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(orderService.getActiveBills(user.getUserId())));
    }
}
