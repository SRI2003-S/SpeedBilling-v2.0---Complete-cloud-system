package com.speedbilling.repository;

import com.speedbilling.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByInvoiceNo(String invoiceNo);

    List<Order> findByShiftIdOrderByCreatedAtDesc(Long shiftId);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.shiftId = :shiftId")
    BigDecimal getTotalSalesByShift(Long shiftId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.shiftId = :shiftId")
    long countByShiftId(Long shiftId);

    @Query("SELECT o FROM Order o WHERE o.createdAt BETWEEN :start AND :end ORDER BY o.createdAt DESC")
    List<Order> findByDateRange(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    BigDecimal getTotalSalesBetween(LocalDateTime start, LocalDateTime end);
}
