package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Photo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long photoId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "storage_key", nullable = false, length = 500)
    private String storageKey;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "mime_type", nullable = false, length = 50)
    private String mimeType;

    @Column(name = "photo_type", nullable = false, length = 30)
    private String photoType;

    @Column(length = 50)
    @Builder.Default
    private String category = "general";

    @Column(name = "public_url", columnDefinition = "TEXT")
    private String publicUrl;

    @Column(name = "thumbnail_url", columnDefinition = "TEXT")
    private String thumbnailUrl;

    @Column(name = "uploaded_by")
    private Long uploadedBy;

    @Column(name = "uploaded_at", nullable = false)
    @Builder.Default
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
