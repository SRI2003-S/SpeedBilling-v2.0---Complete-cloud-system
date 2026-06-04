package com.speedbilling.repository;

import com.speedbilling.entity.ServiceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceSessionRepository extends JpaRepository<ServiceSession, Long> {
    List<ServiceSession> findByCustomerIdOrderBySessionDateDesc(Long customerId);

    List<ServiceSession> findByStatusOrderBySessionDateDesc(String status);

    @Query("SELECT s FROM ServiceSession s WHERE s.nextSessionDate = :date ORDER BY s.sessionDate DESC")
    List<ServiceSession> findByNextSessionDate(LocalDate date);

    @Query("SELECT s FROM ServiceSession s WHERE s.nextSessionDate BETWEEN :start AND :end ORDER BY s.nextSessionDate ASC")
    List<ServiceSession> findByNextSessionDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT s FROM ServiceSession s WHERE s.nextSessionDate < :today AND s.status = 'completed' ORDER BY s.nextSessionDate ASC")
    List<ServiceSession> findOverdueSessions(LocalDate today);

    @Query("SELECT s FROM ServiceSession s WHERE s.sessionDate BETWEEN :start AND :end ORDER BY s.sessionDate ASC")
    List<ServiceSession> findBySessionDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM ServiceSession s WHERE DATE(s.sessionDate) = :date ORDER BY s.sessionDate ASC")
    List<ServiceSession> findBySessionDate(LocalDate date);

    long countByStatus(String status);

    @Query("SELECT COUNT(s) FROM ServiceSession s WHERE s.nextSessionDate BETWEEN :start AND :end")
    long countByNextSessionDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT COUNT(s) FROM ServiceSession s WHERE s.nextSessionDate < :today AND s.status = 'completed'")
    long countOverdueSessions(LocalDate today);
}
