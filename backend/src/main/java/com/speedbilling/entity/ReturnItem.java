package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "return_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long returnItemId;

    @Column(name = "return_id", nullable = false)
    private Long returnId;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
