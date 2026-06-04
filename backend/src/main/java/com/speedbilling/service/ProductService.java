package com.speedbilling.service;

import com.speedbilling.dto.response.BatchResponse;
import com.speedbilling.dto.response.ProductResponse;
import com.speedbilling.entity.Batch;
import com.speedbilling.entity.Product;
import com.speedbilling.repository.BatchRepository;
import com.speedbilling.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final BatchRepository batchRepository;

    public List<ProductResponse> searchProducts(String query) {
        List<Product> products;
        if (query == null || query.trim().isEmpty()) {
            products = productRepository.findByIsActiveTrue();
        } else {
            products = productRepository.searchProducts(query.trim());
        }

        return products.stream().map(this::toProductResponse).collect(Collectors.toList());
    }

    public ProductResponse getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        return toProductResponse(product);
    }

    public ProductResponse getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Product not found with barcode: " + barcode));
        return toProductResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(Product product) {
        if (productRepository.findByBarcode(product.getBarcode()).isPresent()) {
            throw new RuntimeException("Product with barcode " + product.getBarcode() + " already exists");
        }
        product = productRepository.save(product);
        return toProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, Product updates) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));

        if (updates.getBarcode() != null &&
                !updates.getBarcode().equals(product.getBarcode())) {
            productRepository.findByBarcode(updates.getBarcode())
                    .ifPresent(p -> {
                        if (!p.getProductId().equals(id)) {
                            throw new RuntimeException("Barcode already in use");
                        }
                    });
        }

        if (updates.getProductName() != null) product.setProductName(updates.getProductName());
        if (updates.getBarcode() != null) product.setBarcode(updates.getBarcode());
        if (updates.getComposition() != null) product.setComposition(updates.getComposition());
        if (updates.getManufacturer() != null) product.setManufacturer(updates.getManufacturer());
        if (updates.getCategory() != null) product.setCategory(updates.getCategory());
        if (updates.getHsnCode() != null) product.setHsnCode(updates.getHsnCode());
        if (updates.getTaxRate() != null) product.setTaxRate(updates.getTaxRate());

        product = productRepository.save(product);
        return toProductResponse(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
        product.setIsActive(false);
        productRepository.save(product);
    }

    @Transactional
    public BatchResponse addBatch(Batch batch) {
        Long productId = batch.getProductId();
        productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        Batch saved = batchRepository.save(batch);
        return toBatchResponse(saved);
    }

    @Transactional
    public BatchResponse updateBatch(Long id, Batch updates) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found: " + id));

        if (updates.getBatchCode() != null) batch.setBatchCode(updates.getBatchCode());
        if (updates.getExpiryDate() != null) batch.setExpiryDate(updates.getExpiryDate());
        if (updates.getCostPrice() != null) batch.setCostPrice(updates.getCostPrice());
        if (updates.getMrp() != null) batch.setMrp(updates.getMrp());
        if (updates.getSellingPrice() != null) batch.setSellingPrice(updates.getSellingPrice());
        if (updates.getStocks() != null) batch.setStocks(updates.getStocks());

        batch = batchRepository.save(batch);
        return toBatchResponse(batch);
    }

    @Transactional
    public void deleteBatch(Long id) {
        batchRepository.deleteById(id);
    }

    public List<BatchResponse> getProductBatches(Long productId) {
        return batchRepository.findByProductIdOrderByExpiryDateAsc(productId).stream()
                .map(this::toBatchResponse)
                .collect(Collectors.toList());
    }

    private ProductResponse toProductResponse(Product product) {
        List<Batch> batches = batchRepository.findByProductIdOrderByExpiryDateAsc(product.getProductId());
        LocalDate today = LocalDate.now();

        int totalStocks = 0;
        int expiredStocks = 0;
        int nearExpiryStocks = 0;
        BigDecimal sellingPrice = BigDecimal.ZERO;

        for (Batch b : batches) {
            totalStocks += b.getStocks() != null ? b.getStocks() : 0;
            if (b.getStocks() > 0) {
                sellingPrice = b.getSellingPrice();
                long daysToExpiry = ChronoUnit.DAYS.between(today, b.getExpiryDate());
                if (daysToExpiry < 0) {
                    expiredStocks += b.getStocks();
                } else if (daysToExpiry < 90) {
                    nearExpiryStocks += b.getStocks();
                }
            }
        }

        String status = totalStocks == 0 ? "Out of Stock" :
                        expiredStocks > 0 ? "Has Expired" :
                        totalStocks < 10 ? "Low Stock" : "Good";

        List<BatchResponse> batchResponses = batches.stream()
                .map(this::toBatchResponse)
                .collect(Collectors.toList());

        return ProductResponse.builder()
                .productId(product.getProductId())
                .barcode(product.getBarcode())
                .productName(product.getProductName())
                .composition(product.getComposition())
                .manufacturer(product.getManufacturer())
                .scheduleType(product.getScheduleType())
                .category(product.getCategory())
                .hsnCode(product.getHsnCode())
                .taxRate(product.getTaxRate())
                .sellingPrice(sellingPrice)
                .totalStocks(totalStocks)
                .expiredStocks(expiredStocks)
                .nearExpiryStocks(nearExpiryStocks)
                .status(status)
                .batches(batchResponses)
                .build();
    }

    private BatchResponse toBatchResponse(Batch batch) {
        LocalDate today = LocalDate.now();
        long daysToExpiry = ChronoUnit.DAYS.between(today, batch.getExpiryDate());
        String expiryStatus = daysToExpiry < 0 ? "expired" :
                              daysToExpiry < 90 ? "near_expiry" : "valid";

        return BatchResponse.builder()
                .batchId(batch.getBatchId())
                .productId(batch.getProductId())
                .batchCode(batch.getBatchCode())
                .expiryDate(batch.getExpiryDate())
                .costPrice(batch.getCostPrice())
                .mrp(batch.getMrp())
                .sellingPrice(batch.getSellingPrice())
                .stocks(batch.getStocks())
                .expiryStatus(expiryStatus)
                .build();
    }
}
