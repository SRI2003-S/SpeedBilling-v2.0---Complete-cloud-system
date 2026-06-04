package com.speedbilling.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ReturnRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Refund amount is required")
    private BigDecimal refundAmount;

    private String reason;

    @NotEmpty(message = "At least one return item is required")
    private List<ReturnItemRequest> items;

    @Data
    public static class ReturnItemRequest {
        private Long productId;
        private int qty;
    }
}
