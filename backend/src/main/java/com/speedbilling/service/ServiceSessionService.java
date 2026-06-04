package com.speedbilling.service;

import com.speedbilling.dto.request.ServiceSessionRequest;
import com.speedbilling.dto.response.ServiceSessionResponse;
import com.speedbilling.entity.*;
import com.speedbilling.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceSessionService {

    private final ServiceSessionRepository sessionRepository;
    private final CustomerRepository customerRepository;
    private final PhotoRepository photoRepository;

    public List<ServiceSessionResponse> getCustomerSessions(Long customerId) {
        return sessionRepository.findByCustomerIdOrderBySessionDateDesc(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ServiceSessionResponse getSession(Long id) {
        ServiceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
        return toResponse(session);
    }

    @Transactional
    public ServiceSessionResponse createSession(ServiceSessionRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Calculate next session date
        LocalDate nextSessionDate = calculateNextSessionDate(request);

        ServiceSession session = ServiceSession.builder()
                .customerId(request.getCustomerId())
                .sessionDate(request.getSessionDate() != null ? request.getSessionDate() : LocalDateTime.now())
                .serviceType(request.getServiceType())
                .serviceDescription(request.getServiceDescription())
                .technicianName(request.getTechnicianName())
                .productsUsed(request.getProductsUsed())
                .bundlesUsed(request.getBundlesUsed())
                .cost(request.getCost() != null ? request.getCost() : BigDecimal.ZERO)
                .customerRating(request.getCustomerRating())
                .notes(request.getNotes())
                .nextSessionDate(nextSessionDate)
                .nextSessionInterval(request.getNextSessionInterval())
                .status(request.getStatus() != null ? request.getStatus() : "completed")
                .build();

        session = sessionRepository.save(session);

        // Update customer's last visit and total visits
        customer.setLastVisitDate(LocalDateTime.now());
        customer.setTotalVisits(customer.getTotalVisits() != null ? customer.getTotalVisits() + 1 : 1);
        customerRepository.save(customer);

        return toResponse(session);
    }

    @Transactional
    public ServiceSessionResponse updateSession(Long id, ServiceSessionRequest request) {
        ServiceSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + id));

        session.setServiceType(request.getServiceType());
        session.setServiceDescription(request.getServiceDescription());
        session.setTechnicianName(request.getTechnicianName());
        session.setProductsUsed(request.getProductsUsed());
        session.setBundlesUsed(request.getBundlesUsed());
        session.setCost(request.getCost());
        session.setCustomerRating(request.getCustomerRating());
        session.setNotes(request.getNotes());
        session.setStatus(request.getStatus() != null ? request.getStatus() : session.getStatus());

        // Recalculate next session if needed
        if (request.getNextSessionOption() != null) {
            session.setNextSessionDate(calculateNextSessionDate(request));
            session.setNextSessionInterval(request.getNextSessionInterval());
        }

        session = sessionRepository.save(session);
        return toResponse(session);
    }

    @Transactional
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    private LocalDate calculateNextSessionDate(ServiceSessionRequest request) {
        LocalDate baseDate = request.getSessionDate() != null ?
                request.getSessionDate().toLocalDate() : LocalDate.now();

        if (request.getNextSessionOption() != null) {
            return switch (request.getNextSessionOption()) {
                case "days_30" -> baseDate.plusDays(30);
                case "days_45" -> baseDate.plusDays(45);
                case "days_60" -> baseDate.plusDays(60);
                case "custom" -> request.getNextSessionDate();
                default -> null;
            };
        }

        if (request.getNextSessionInterval() != null) {
            return baseDate.plusDays(request.getNextSessionInterval());
        }

        return request.getNextSessionDate();
    }

    private ServiceSessionResponse toResponse(ServiceSession session) {
        String customerName = "";
        try {
            customerName = customerRepository.findById(session.getCustomerId())
                    .map(Customer::getName).orElse("");
        } catch (Exception ignored) {}

        List<Photo> photos = photoRepository.findBySessionIdOrderByUploadedAtDesc(session.getSessionId());
        List<ServiceSessionResponse.PhotoResponse> photoResponses = photos.stream()
                .map(p -> ServiceSessionResponse.PhotoResponse.builder()
                        .photoId(p.getPhotoId())
                        .photoType(p.getPhotoType())
                        .publicUrl(p.getPublicUrl())
                        .thumbnailUrl(p.getThumbnailUrl())
                        .fileName(p.getFileName())
                        .build())
                .collect(Collectors.toList());

        return ServiceSessionResponse.builder()
                .sessionId(session.getSessionId())
                .customerId(session.getCustomerId())
                .customerName(customerName)
                .sessionDate(session.getSessionDate())
                .serviceType(session.getServiceType())
                .serviceDescription(session.getServiceDescription())
                .technicianName(session.getTechnicianName())
                .productsUsed(session.getProductsUsed())
                .bundlesUsed(session.getBundlesUsed())
                .cost(session.getCost())
                .customerRating(session.getCustomerRating())
                .notes(session.getNotes())
                .nextSessionDate(session.getNextSessionDate())
                .nextSessionInterval(session.getNextSessionInterval())
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .photos(photoResponses)
                .build();
    }
}
