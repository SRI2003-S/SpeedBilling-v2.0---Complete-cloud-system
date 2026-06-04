package com.speedbilling.controller;

import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.dto.response.BatchResponse;
import com.speedbilling.dto.response.ProductResponse;
import com.speedbilling.entity.Batch;
import com.speedbilling.entity.Product;
import com.speedbilling.service.AuthService;
import com.speedbilling.service.ProductService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(
            @RequestParam(required = false) String q,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(q)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProduct(
            @PathVariable Long id,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(productService.getProduct(id)));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductByBarcode(
            @PathVariable String barcode,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(productService.getProductByBarcode(barcode)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody Product product,
            HttpSession session) {
        authService.requireAdmin(session);
        return ResponseEntity.ok(ApiResponse.success("Product created", productService.createProduct(product)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            HttpSession session) {
        authService.requireAdmin(session);
        return ResponseEntity.ok(ApiResponse.success("Product updated", productService.updateProduct(id, product)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            HttpSession session) {
        authService.requireAdmin(session);
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted", null));
    }

    @GetMapping("/{id}/batches")
    public ResponseEntity<ApiResponse<List<BatchResponse>>> getBatches(
            @PathVariable Long id,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(productService.getProductBatches(id)));
    }

    @PostMapping("/batches")
    public ResponseEntity<ApiResponse<BatchResponse>> addBatch(
            @Valid @RequestBody Batch batch,
            HttpSession session) {
        authService.requireAdmin(session);
        return ResponseEntity.ok(ApiResponse.success("Batch added", productService.addBatch(batch)));
    }

    @PutMapping("/batches/{id}")
    public ResponseEntity<ApiResponse<BatchResponse>> updateBatch(
            @PathVariable Long id,
            @RequestBody Batch batch,
            HttpSession session) {
        authService.requireAdmin(session);
        return ResponseEntity.ok(ApiResponse.success("Batch updated", productService.updateBatch(id, batch)));
    }

    @DeleteMapping("/batches/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(
            @PathVariable Long id,
            HttpSession session) {
        authService.requireAdmin(session);
        productService.deleteBatch(id);
        return ResponseEntity.ok(ApiResponse.success("Batch deleted", null));
    }
}
