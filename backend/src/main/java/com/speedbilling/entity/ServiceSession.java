package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceSession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "session_date", nullable = false)
    @Builder.Default
    private LocalDateTime sessionDate = LocalDateTime.now();

    @Column(name = "service_type", nullable = false, length = 100)
    private String serviceType;

    @Column(name = "service_description", columnDefinition = "TEXT")
    private String serviceDescription;

    @Column(name = "technician_name", length = 200)
    private String technicianName;

    @Column(name = "products_used", columnDefinition = "TEXT")
    private String productsUsed;

    @Column(name = "bundles_used")
    private Integer bundlesUsed;

    @Column(precision = 12, scale = 2)
    private BigDecimal cost;

    @Column(name = "customer_rating")
    private Integer customerRating;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "next_session_date")
    private LocalDate nextSessionDate;

    @Column(name = "next_session_interval")
    private Integer nextSessionInterval;

    @Column(name = "next_session_reminder_sent")
    @Builder.Default
    private Boolean nextSessionReminderSent = false;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "completed";

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
