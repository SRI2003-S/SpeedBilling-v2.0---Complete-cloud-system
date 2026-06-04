package com.speedbilling.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateOrderRequest {
    private String customerPhone;
    private String customerName;
    private String customerEmail;
    private BigDecimal subTotal;
    private BigDecimal discount;
    private BigDecimal totalAmount;
    private String doctorName;
    private String notes;

    @NotEmpty(message = "At least one item is required")
    private List<OrderItemRequest> items;

    @NotNull(message = "Payment details are required")
    private PaymentRequest paymentDetails;

    @Data
    public static class OrderItemRequest {
        private Long productId;
        private Long batchId;
        private String name;
        private int qty;
        private BigDecimal price;
        private boolean isManual;
    }

    @Data
    public static class PaymentRequest {
        private BigDecimal cash;
        private BigDecimal upi;
        private BigDecimal card;
        private String upiTxnId;
        private String cardTxnId;
    }
}
