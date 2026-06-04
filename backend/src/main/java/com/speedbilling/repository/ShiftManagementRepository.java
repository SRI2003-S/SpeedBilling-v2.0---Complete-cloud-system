package com.speedbilling.repository;

import com.speedbilling.entity.ShiftManagement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShiftManagementRepository extends JpaRepository<ShiftManagement, Long> {
    Optional<ShiftManagement> findByUserIdAndStatusTrue(Long userId);
    List<ShiftManagement> findByUserIdOrderByStartTimeDesc(Long userId);
    List<ShiftManagement> findAllByOrderByStartTimeDesc();
    long countByStatusTrue();
}
