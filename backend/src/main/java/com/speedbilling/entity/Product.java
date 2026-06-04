package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(unique = true, nullable = false, length = 100)
    private String barcode;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(length = 500)
    private String composition;

    @Column(length = 200)
    private String manufacturer;

    @Column(name = "schedule_type", length = 20)
    @Builder.Default
    private String scheduleType = "Normal";

    @Column(nullable = false, length = 100)
    private String category;

    @Column(name = "hsn_code", length = 20)
    private String hsnCode;

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "productId", fetch = FetchType.LAZY)
    private List<Batch> batches;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
