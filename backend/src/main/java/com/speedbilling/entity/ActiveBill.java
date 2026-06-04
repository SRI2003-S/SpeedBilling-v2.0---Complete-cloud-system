package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "active_bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActiveBill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "bills_data", nullable = false, columnDefinition = "JSONB")
    private String billsData;

    @Column(name = "last_updated", nullable = false)
    @Builder.Default
    private LocalDateTime lastUpdated = LocalDateTime.now();
}
