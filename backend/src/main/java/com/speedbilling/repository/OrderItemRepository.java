package com.speedbilling.repository;

import com.speedbilling.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi WHERE oi.productId = :productId")
    long getTotalSoldQuantity(Long productId);

    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(oi.totalPrice), 0) FROM OrderItem oi WHERE oi.productId = :productId")
    java.math.BigDecimal getTotalRevenue(Long productId);
}
