package com.speedbilling.repository;

import com.speedbilling.entity.Return;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReturnRepository extends JpaRepository<Return, Long> {
    List<Return> findByShiftIdOrderByReturnTimeDesc(Long shiftId);
    List<Return> findByOrderId(Long orderId);
}
