package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal cash = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal upi = BigDecimal.ZERO;

    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal card = BigDecimal.ZERO;

    @Column(name = "total_paid", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPaid;

    @Column(name = "excess_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal excessAmount = BigDecimal.ZERO;

    @Column(name = "payment_time", nullable = false)
    @Builder.Default
    private LocalDateTime paymentTime = LocalDateTime.now();

    @Column(name = "upi_txn_id", length = 200)
    private String upiTxnId;

    @Column(name = "card_txn_id", length = 200)
    private String cardTxnId;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
