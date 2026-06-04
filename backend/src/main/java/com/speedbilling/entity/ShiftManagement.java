package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shift_management")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftManagement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shiftId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "opening_cash", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal openingCash = BigDecimal.ZERO;

    @Column(name = "final_cash", precision = 12, scale = 2)
    private BigDecimal finalCash;

    @Column(name = "start_time", nullable = false)
    @Builder.Default
    private LocalDateTime startTime = LocalDateTime.now();

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(nullable = false)
    @Builder.Default
    private Boolean status = true;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
