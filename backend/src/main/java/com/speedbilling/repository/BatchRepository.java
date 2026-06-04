package com.speedbilling.repository;

import com.speedbilling.entity.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByProductIdOrderByExpiryDateAsc(Long productId);

    @Query("SELECT b FROM Batch b WHERE b.productId = :productId AND b.stocks > 0 ORDER BY b.expiryDate ASC")
    List<Batch> findActiveBatchesByProductId(Long productId);

    @Query("SELECT b FROM Batch b WHERE b.productId = :productId AND b.stocks > 0 AND b.expiryDate >= :today ORDER BY b.expiryDate ASC")
    List<Batch> findValidBatchesByProductId(Long productId, LocalDate today);

    List<Batch> findByExpiryDateBefore(LocalDate date);
    long countByProductId(Long productId);
}
