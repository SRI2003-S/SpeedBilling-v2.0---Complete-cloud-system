package com.speedbilling.repository;

import com.speedbilling.entity.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByReminderDate(LocalDate date);
    List<Reminder> findByStatus(String status);
    List<Reminder> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT r FROM Reminder r WHERE r.reminderDate BETWEEN :start AND :end AND r.status = 'pending' ORDER BY r.reminderDate ASC")
    List<Reminder> findPendingRemindersBetween(LocalDate start, LocalDate end);

    @Query("SELECT r FROM Reminder r WHERE r.reminderDate < :today AND r.status = 'pending'")
    List<Reminder> findOverdueReminders(LocalDate today);
}
