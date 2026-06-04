package com.speedbilling.repository;

import com.speedbilling.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    List<Photo> findByCustomerIdOrderByUploadedAtDesc(Long customerId);
    List<Photo> findBySessionIdOrderByUploadedAtDesc(Long sessionId);
    List<Photo> findByCustomerIdAndPhotoTypeOrderByUploadedAtDesc(Long customerId, String photoType);
    long countByCustomerId(Long customerId);
}
