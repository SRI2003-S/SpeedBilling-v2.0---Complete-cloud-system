package com.speedbilling.controller;

import com.speedbilling.dto.response.ApiResponse;
import com.speedbilling.entity.Photo;
import com.speedbilling.service.AuthService;
import com.speedbilling.service.PhotoService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService photoService;
    private final AuthService authService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Photo>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam("customerId") Long customerId,
            @RequestParam(value = "sessionId", required = false) Long sessionId,
            @RequestParam("photoType") String photoType,
            HttpSession session) {
        var user = authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded",
                photoService.uploadPhoto(file, customerId, sessionId, photoType, user.getUserId())));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<Photo>>> getCustomerPhotos(
            @PathVariable Long customerId,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(photoService.getCustomerPhotos(customerId)));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ApiResponse<List<Photo>>> getSessionPhotos(
            @PathVariable Long sessionId,
            HttpSession session) {
        authService.getCurrentUser(session);
        return ResponseEntity.ok(ApiResponse.success(photoService.getSessionPhotos(sessionId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePhoto(
            @PathVariable Long id,
            HttpSession session) {
        authService.getCurrentUser(session);
        photoService.deletePhoto(id);
        return ResponseEntity.ok(ApiResponse.success("Photo deleted", null));
    }
}
