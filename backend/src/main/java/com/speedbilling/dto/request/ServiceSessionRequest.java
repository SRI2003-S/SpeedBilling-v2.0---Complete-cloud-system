package com.speedbilling.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ServiceSessionRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private LocalDateTime sessionDate;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String serviceDescription;
    private String technicianName;
    private String productsUsed;
    private Integer bundlesUsed;
    private BigDecimal cost;
    private Integer customerRating;
    private String notes;

    // Next session tracking
    private String nextSessionOption;    // "days_30", "days_45", "days_60", "custom"
    private LocalDate nextSessionDate;    // Used when option is "custom"
    private Integer nextSessionInterval;  // 30, 45, or 60

    private String status;
}
