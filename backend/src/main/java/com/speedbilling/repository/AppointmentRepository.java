package com.speedbilling.repository;

import com.speedbilling.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByCustomerIdOrderByAppointmentDateDesc(Long customerId);

    @Query("SELECT a FROM Appointment a WHERE DATE(a.appointmentDate) = :date ORDER BY a.appointmentDate ASC")
    List<Appointment> findByAppointmentDate(LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :start AND :end ORDER BY a.appointmentDate ASC")
    List<Appointment> findByAppointmentDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.status = :status ORDER BY a.appointmentDate ASC")
    List<Appointment> findByStatusOrderByAppointmentDateAsc(String status);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :start AND :end AND a.status IN :statuses ORDER BY a.appointmentDate ASC")
    List<Appointment> findByDateRangeAndStatuses(LocalDateTime start, LocalDateTime end, List<String> statuses);

    long countByStatus(String status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate BETWEEN :start AND :end")
    long countByDateRange(LocalDateTime start, LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.assignedTo = :userId AND a.appointmentDate BETWEEN :start AND :end ORDER BY a.appointmentDate ASC")
    List<Appointment> findByStaffAndDateRange(Long userId, LocalDateTime start, LocalDateTime end);
}
