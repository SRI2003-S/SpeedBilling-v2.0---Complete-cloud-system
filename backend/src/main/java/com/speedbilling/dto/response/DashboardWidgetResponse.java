package com.speedbilling.dto.response;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardWidgetResponse {
    private long todaySessions;
    private long tomorrowSessions;
    private long weekSessions;
    private long overdueCustomers;
    private long missedSessions;
    private long followUpDue;
    private List<SessionSummary> recentSessions;
    private List<CustomerSummary> dueTodayCustomers;
    private List<CustomerSummary> overdueCustomersList;
    private ShiftSummary currentShift;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SessionSummary {
        private Long sessionId;
        private String customerName;
        private String serviceType;
        private String sessionDate;
        private String status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CustomerSummary {
        private Long customerId;
        private String name;
        private String phone;
        private String lastVisit;
        private String nextSessionDate;
        private String hairExtensionType;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShiftSummary {
        private Long shiftId;
        private String cashierName;
        private String startTime;
        private String status;
    }
}
