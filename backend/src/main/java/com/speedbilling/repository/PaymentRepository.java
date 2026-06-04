package com.speedbilling.repository;

import com.speedbilling.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByOrderId(Long orderId);

    @Query("SELECT COALESCE(SUM(p.cash), 0), COALESCE(SUM(p.upi), 0), COALESCE(SUM(p.card), 0) FROM Payment p " +
           "JOIN Order o ON p.orderId = o.orderId WHERE o.shiftId = :shiftId")
    List<Object[]> getPaymentSummaryByShift(Long shiftId);

    List<Payment> findByPaymentTimeBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
}
