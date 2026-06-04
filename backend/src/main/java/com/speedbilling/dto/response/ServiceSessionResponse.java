package com.speedbilling.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceSessionResponse {
    private Long sessionId;
    private Long customerId;
    private String customerName;
    private LocalDateTime sessionDate;
    private String serviceType;
    private String serviceDescription;
    private String technicianName;
    private String productsUsed;
    private Integer bundlesUsed;
    private BigDecimal cost;
    private Integer customerRating;
    private String notes;
    private LocalDate nextSessionDate;
    private Integer nextSessionInterval;
    private String status;
    private LocalDateTime createdAt;
    private List<PhotoResponse> photos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PhotoResponse {
        private Long photoId;
        private String photoType;
        private String publicUrl;
        private String thumbnailUrl;
        private String fileName;
    }
}
