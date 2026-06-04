package com.speedbilling.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reminder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reminderId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "session_id")
    private Long sessionId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "reminder_type", nullable = false, length = 50)
    private String reminderType;

    @Column(name = "reminder_date", nullable = false)
    private LocalDate reminderDate;

    @Column(nullable = false, length = 20)
    @Builder.Default
    private String status = "pending";

    @Column(length = 20)
    @Builder.Default
    private String channel = "dashboard";

    @Column(name = "message_sent")
    @Builder.Default
    private Boolean messageSent = false;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
