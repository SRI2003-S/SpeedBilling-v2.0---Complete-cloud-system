package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "appointment_date", nullable = false)
    private LocalDateTime appointmentDate;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "service_type", nullable = false, length = 100)
    private String serviceType;

    @Column(name = "service_description", columnDefinition = "TEXT")
    private String serviceDescription;

    @Column(name = "duration_minutes")
    @Builder.Default
    private Integer durationMinutes = 60;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "scheduled";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reminder_sent")
    @Builder.Default
    private Boolean reminderSent = false;

    @Column(name = "reminder_sent_at")
    private LocalDateTime reminderSentAt;

    @Column(name = "assigned_to")
    private Long assignedTo;

    @Column(name = "created_by")
    private Long createdBy;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
