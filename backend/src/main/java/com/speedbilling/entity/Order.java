package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Column(name = "invoice_no", unique = true, nullable = false, length = 50)
    private String invoiceNo;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "shift_id", nullable = false)
    private Long shiftId;

    @Column(name = "total_amount_before_tax", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmountBeforeTax = BigDecimal.ZERO;

    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "doctor_name", length = 200)
    private String doctorName;

    @Column(name = "final_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal finalAmount;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "Paid";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
