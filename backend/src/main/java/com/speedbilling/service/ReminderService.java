package com.speedbilling.service;

import com.speedbilling.entity.*;
import com.speedbilling.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final ServiceSessionRepository sessionRepository;
    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;

    /**
     * Automated reminder engine: runs every day at 9:00 AM
     * Checks for:
     * 1. Customers due for follow-up today
     * 2. Upcoming appointments tomorrow
     * 3. Overdue sessions
     */
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional
    public void processDailyReminders() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate weekEnd = today.plusDays(7);

        // 1. Process sessions due today
        List<ServiceSession> dueToday = sessionRepository.findByNextSessionDate(today);
        for (ServiceSession session : dueToday) {
            createReminder(session.getCustomerId(), session.getSessionId(), null,
                    "maintenance_due", today, "dashboard");
        }

        // 2. Process upcoming appointments for tomorrow
        List<Appointment> upcomingAppointments = appointmentRepository
                .findByAppointmentDate(tomorrow);
        for (Appointment appointment : upcomingAppointments) {
            createReminder(appointment.getCustomerId(), null, appointment.getAppointmentId(),
                    "appointment_reminder", tomorrow, "dashboard");
        }

        // 3. Process overdue sessions (past next_session_date)
        List<ServiceSession> overdueSessions = sessionRepository.findOverdueSessions(today);
        for (ServiceSession session : overdueSessions) {
            createReminder(session.getCustomerId(), session.getSessionId(), null,
                    "overdue_session", today, "dashboard");
        }

        // 4. Process customers due this week for follow-up
        List<ServiceSession> weekSessions = sessionRepository.findByNextSessionDateBetween(today, weekEnd);
        for (ServiceSession session : weekSessions) {
            // Only create if not already reminded
            boolean alreadyReminded = session.getNextSessionReminderSent() != null &&
                    session.getNextSessionReminderSent();
            if (!alreadyReminded) {
                createReminder(session.getCustomerId(), session.getSessionId(), null,
                        "follow_up", session.getNextSessionDate(), "dashboard");
                session.setNextSessionReminderSent(true);
                sessionRepository.save(session);
            }
        }
    }

    @Transactional
    public Reminder createReminder(Long customerId, Long sessionId, Long appointmentId,
                                    String reminderType, LocalDate reminderDate, String channel) {
        Reminder reminder = Reminder.builder()
                .customerId(customerId)
                .sessionId(sessionId)
                .appointmentId(appointmentId)
                .reminderType(reminderType)
                .reminderDate(reminderDate)
                .status("pending")
                .channel(channel)
                .build();
        return reminderRepository.save(reminder);
    }

    public List<Reminder> getDueReminders(LocalDate date) {
        return reminderRepository.findByReminderDate(date);
    }

    public List<Reminder> getPendingReminders() {
        return reminderRepository.findByStatus("pending");
    }

    @Transactional
    public void markReminderSent(Long reminderId) {
        Reminder reminder = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        reminder.setStatus("sent");
        reminder.setMessageSent(true);
        reminder.setSentAt(LocalDateTime.now());
        reminderRepository.save(reminder);
    }

    public long getOverdueCount() {
        return sessionRepository.countOverdueSessions(LocalDate.now());
    }

    public long getDueTodayCount() {
        LocalDate today = LocalDate.now();
        return sessionRepository.countByNextSessionDateBetween(today, today);
    }

    public long getDueThisWeekCount() {
        LocalDate today = LocalDate.now();
        LocalDate weekEnd = today.plusDays(7);
        return sessionRepository.countByNextSessionDateBetween(today, weekEnd);
    }
}
