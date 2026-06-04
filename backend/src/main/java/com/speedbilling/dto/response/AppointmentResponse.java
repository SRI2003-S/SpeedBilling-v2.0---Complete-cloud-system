package com.speedbilling.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {
    private Long appointmentId;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private LocalDateTime appointmentDate;
    private LocalDateTime endTime;
    private String serviceType;
    private String serviceDescription;
    private Integer durationMinutes;
    private String status;
    private String notes;
    private boolean reminderSent;
    private String assignedToName;
    private LocalDateTime createdAt;
}
