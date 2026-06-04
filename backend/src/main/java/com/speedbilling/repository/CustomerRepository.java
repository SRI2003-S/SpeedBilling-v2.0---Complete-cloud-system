package com.speedbilling.repository;

import com.speedbilling.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhoneNumber(String phoneNumber);

    @Query("SELECT c FROM Customer c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "c.phoneNumber LIKE CONCAT('%', :query, '%') OR " +
           "LOWER(c.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Customer> searchCustomers(String query);

    @Query("SELECT c FROM Customer c WHERE c.status = 'active' ORDER BY c.lastVisitDate DESC NULLS LAST")
    List<Customer> findActiveCustomers();

    List<Customer> findByStatusOrderByCreatedAtDesc(String status);

    @Query("SELECT c FROM Customer c WHERE c.lastVisitDate IS NOT NULL ORDER BY c.lastVisitDate DESC")
    List<Customer> findRecentVisitors();

    long countByStatus(String status);
}
