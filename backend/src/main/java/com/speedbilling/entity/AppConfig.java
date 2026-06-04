package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_config")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long configId;

    @Column(name = "config_key", unique = true, nullable = false, length = 100)
    private String configKey;

    @Column(name = "config_value", nullable = false, columnDefinition = "TEXT")
    private String configValue;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
