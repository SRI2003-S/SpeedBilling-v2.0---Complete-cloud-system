package com.speedbilling.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long orderId;
    private String invoiceNo;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private BigDecimal subTotal;
    private BigDecimal discount;
    private BigDecimal taxAmount;
    private BigDecimal finalAmount;
    private String doctorName;
    private String status;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
    private PaymentResponse payment;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemResponse {
        private String itemName;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PaymentResponse {
        private BigDecimal cash;
        private BigDecimal upi;
        private BigDecimal card;
        private BigDecimal totalPaid;
        private BigDecimal excessAmount;
    }
}
