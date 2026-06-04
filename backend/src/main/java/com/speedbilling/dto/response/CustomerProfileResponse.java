package com.speedbilling.dto.response;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerProfileResponse {
    private Long customerId;
    private String name;
    private String phoneNumber;
    private String email;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private LocalDate dateOfBirth;
    private String gender;
    private String photoUrl;
    private String hairExtensionType;
    private String hairLength;
    private String hairColor;
    private LocalDate installationDate;
    private String status;
    private String notes;
    private String referredBy;
    private LocalDateTime lastVisitDate;
    private int totalVisits;
    private LocalDateTime createdAt;
    private List<TimelineEvent> timeline;
    private long totalSessions;
    private long totalOrders;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelineEvent {
        private String type;        // "SESSION", "ORDER", "INSTALLATION"
        private LocalDateTime date;
        private String title;
        private String description;
        private String status;
        private String amount;
        private String serviceType;
        private Long referenceId;
    }
}
