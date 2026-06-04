package com.speedbilling.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchResponse {
    private Long batchId;
    private Long productId;
    private String batchCode;
    private LocalDate expiryDate;
    private BigDecimal costPrice;
    private BigDecimal mrp;
    private BigDecimal sellingPrice;
    private Integer stocks;
    private String expiryStatus;  // "valid", "near_expiry", "expired"
}
