package com.speedbilling.service;

import com.speedbilling.entity.ShiftManagement;
import com.speedbilling.repository.ShiftManagementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ShiftService {

    private final ShiftManagementRepository shiftRepository;

    @Transactional
    public ShiftManagement startShift(Long userId, BigDecimal openingCash) {
        // Check for existing active shift
        shiftRepository.findByUserIdAndStatusTrue(userId)
                .ifPresent(s -> {
                    throw new RuntimeException("Active shift already exists");
                });

        ShiftManagement shift = ShiftManagement.builder()
                .userId(userId)
                .openingCash(openingCash != null ? openingCash : BigDecimal.ZERO)
                .startTime(java.time.LocalDateTime.now())
                .status(true)
                .build();

        return shiftRepository.save(shift);
    }

    @Transactional
    public ShiftManagement closeShift(Long userId, BigDecimal finalCash) {
        ShiftManagement shift = shiftRepository.findByUserIdAndStatusTrue(userId)
                .orElseThrow(() -> new RuntimeException("No active shift found"));

        shift.setFinalCash(finalCash);
        shift.setEndTime(java.time.LocalDateTime.now());
        shift.setStatus(false);
        return shiftRepository.save(shift);
    }

    public ShiftManagement getActiveShift(Long userId) {
        return shiftRepository.findByUserIdAndStatusTrue(userId).orElse(null);
    }

    public List<ShiftManagement> getAllShifts() {
        return shiftRepository.findAllByOrderByStartTimeDesc();
    }

    public ShiftManagement getShift(Long id) {
        return shiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift not found"));
    }
}
