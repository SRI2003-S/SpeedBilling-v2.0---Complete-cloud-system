package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long customerId;

    @Column(name = "phone_number", unique = true, length = 20)
    private String phoneNumber;

    @Column(nullable = false, length = 200)
    @Builder.Default
    private String name = "Walk-in Customer";

    @Column(length = 200)
    @Builder.Default
    private String email = "walkin@example.com";

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(length = 10)
    private String pincode;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 10)
    private String gender;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(name = "hair_extension_type", length = 100)
    private String hairExtensionType;

    @Column(name = "hair_length", length = 50)
    private String hairLength;

    @Column(name = "hair_color", length = 50)
    private String hairColor;

    @Column(name = "installation_date")
    private LocalDate installationDate;

    @Column(length = 20)
    @Builder.Default
    private String status = "active";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "referred_by", length = 200)
    private String referredBy;

    @Column(name = "last_visit_date")
    private LocalDateTime lastVisitDate;

    @Column(name = "total_visits")
    @Builder.Default
    private Integer totalVisits = 0;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
