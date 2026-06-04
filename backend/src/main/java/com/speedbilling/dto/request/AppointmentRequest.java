package com.speedbilling.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AppointmentRequest {
    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Appointment date is required")
    private LocalDateTime appointmentDate;

    private LocalDateTime endTime;

    @NotBlank(message = "Service type is required")
    private String serviceType;

    private String serviceDescription;
    private Integer durationMinutes;
    private String status;
    private String notes;
    private Long assignedTo;
}
