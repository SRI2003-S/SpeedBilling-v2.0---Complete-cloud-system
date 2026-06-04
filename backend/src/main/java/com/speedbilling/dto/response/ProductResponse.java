package com.speedbilling.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {
    private Long productId;
    private String barcode;
    private String productName;
    private String composition;
    private String manufacturer;
    private String scheduleType;
    private String category;
    private String hsnCode;
    private BigDecimal taxRate;
    private BigDecimal sellingPrice;
    private Integer totalStocks;
    private Integer expiredStocks;
    private Integer nearExpiryStocks;
    private String status;
    private List<BatchResponse> batches;
}
