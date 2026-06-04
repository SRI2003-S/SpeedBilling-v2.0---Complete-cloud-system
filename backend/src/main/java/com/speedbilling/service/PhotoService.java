package com.speedbilling.service;

import com.speedbilling.entity.Photo;
import com.speedbilling.repository.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final PhotoRepository photoRepository;

    @Value("${supabase.storage.url}")
    private String storageUrl;

    @Value("${supabase.storage.bucket}")
    private String bucketName;

    @Value("${supabase.anon-key}")
    private String anonKey;

    @Value("${supabase.storage.max-file-size:5242880}")
    private long maxFileSize;

    @Transactional
    public Photo uploadPhoto(MultipartFile file, Long customerId, Long sessionId, String photoType, Long uploadedBy) {
        validateFile(file);

        try {
            String ext = getExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "_" + sanitizeFileName(file.getOriginalFilename());
            String storageKey = "customers/" + customerId + "/" + (sessionId != null ? "sessions/" + sessionId + "/" : "") + fileName;

            // Upload to Supabase Storage via REST API
            String uploadUrl = storageUrl + "/object/" + bucketName + "/" + storageKey;

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", anonKey);
            headers.set("Authorization", "Bearer " + anonKey);
            headers.setContentType(MediaType.parseMediaType(file.getContentType()));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    uploadUrl, HttpMethod.POST, requestEntity, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to upload to Supabase Storage");
            }

            String publicUrl = storageUrl + "/object/public/" + bucketName + "/" + storageKey;

            Photo photo = Photo.builder()
                    .customerId(customerId)
                    .sessionId(sessionId)
                    .storageKey(storageKey)
                    .fileName(file.getOriginalFilename())
                    .fileSize(file.getSize())
                    .mimeType(file.getContentType())
                    .photoType(photoType)
                    .category("general")
                    .publicUrl(publicUrl)
                    .uploadedBy(uploadedBy)
                    .build();

            return photoRepository.save(photo);

        } catch (Exception e) {
            throw new RuntimeException("Photo upload failed: " + e.getMessage());
        }
    }

    public List<Photo> getCustomerPhotos(Long customerId) {
        return photoRepository.findByCustomerIdOrderByUploadedAtDesc(customerId);
    }

    public List<Photo> getSessionPhotos(Long sessionId) {
        return photoRepository.findBySessionIdOrderByUploadedAtDesc(sessionId);
    }

    @Transactional
    public void deletePhoto(Long photoId) {
        Photo photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo not found: " + photoId));

        // Delete from Supabase Storage
        try {
            String deleteUrl = storageUrl + "/object/" + bucketName + "/" + photo.getStorageKey();
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", anonKey);
            headers.set("Authorization", "Bearer " + anonKey);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            restTemplate.exchange(deleteUrl, HttpMethod.DELETE, entity, String.class);
        } catch (Exception e) {
            // Log but don't fail if storage delete fails
            System.err.println("Warning: Could not delete from Supabase Storage: " + e.getMessage());
        }

        photoRepository.delete(photo);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum allowed size of " + (maxFileSize / 1024 / 1024) + "MB");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int lastDot = filename.lastIndexOf('.');
        return lastDot >= 0 ? filename.substring(lastDot) : "";
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
