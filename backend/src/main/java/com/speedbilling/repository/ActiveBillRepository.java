package com.speedbilling.repository;

import com.speedbilling.entity.ActiveBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ActiveBillRepository extends JpaRepository<ActiveBill, Long> {
    Optional<ActiveBill> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}
