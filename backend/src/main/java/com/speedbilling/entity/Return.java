package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "returns")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Return {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long returnId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "shift_id", nullable = false)
    private Long shiftId;

    @Column(name = "refund_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "return_time", nullable = false)
    @Builder.Default
    private LocalDateTime returnTime = LocalDateTime.now();

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
