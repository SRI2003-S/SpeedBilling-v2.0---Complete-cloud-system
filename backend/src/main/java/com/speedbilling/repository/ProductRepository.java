package com.speedbilling.repository;

import com.speedbilling.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByBarcode(String barcode);

    @Query("SELECT p FROM Product p WHERE " +
           "LOWER(p.productName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchProducts(String query);

    List<Product> findByCategory(String category);
    List<Product> findByIsActiveTrue();
    long countByIsActiveTrue();
}
