package com.speedbilling.service;

import com.speedbilling.dto.request.CustomerRequest;
import com.speedbilling.dto.response.CustomerProfileResponse;
import com.speedbilling.entity.*;
import com.speedbilling.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final ServiceSessionRepository sessionRepository;
    private final OrderRepository orderRepository;

    public List<CustomerProfileResponse> searchCustomers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return customerRepository.findActiveCustomers().stream()
                    .map(this::toProfileResponse)
                    .collect(Collectors.toList());
        }
        return customerRepository.searchCustomers(query.trim()).stream()
                .map(this::toProfileResponse)
                .collect(Collectors.toList());
    }

    public CustomerProfileResponse getCustomerProfile(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return toDetailedProfileResponse(customer);
    }

    @Transactional
    public CustomerProfileResponse createCustomer(CustomerRequest request) {
        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isEmpty()) {
            customerRepository.findByPhoneNumber(request.getPhoneNumber())
                    .ifPresent(c -> {
                        throw new RuntimeException("Customer with phone " + request.getPhoneNumber() + " already exists");
                    });
        }

        Customer customer = Customer.builder()
                .name(request.getName())
                .phoneNumber(request.getPhoneNumber())
                .email(request.getEmail())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .dateOfBirth(request.getDateOfBirth())
                .gender(request.getGender())
                .photoUrl(request.getPhotoUrl())
                .hairExtensionType(request.getHairExtensionType())
                .hairLength(request.getHairLength())
                .hairColor(request.getHairColor())
                .installationDate(request.getInstallationDate())
                .status(request.getStatus() != null ? request.getStatus() : "active")
                .notes(request.getNotes())
                .referredBy(request.getReferredBy())
                .totalVisits(0)
                .build();

        customer = customerRepository.save(customer);
        return toDetailedProfileResponse(customer);
    }

    @Transactional
    public CustomerProfileResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        customer.setName(request.getName());
        customer.setPhoneNumber(request.getPhoneNumber());
        customer.setEmail(request.getEmail());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setPincode(request.getPincode());
        customer.setDateOfBirth(request.getDateOfBirth());
        customer.setGender(request.getGender());
        customer.setPhotoUrl(request.getPhotoUrl());
        customer.setHairExtensionType(request.getHairExtensionType());
        customer.setHairLength(request.getHairLength());
        customer.setHairColor(request.getHairColor());
        customer.setInstallationDate(request.getInstallationDate());
        if (request.getStatus() != null) customer.setStatus(request.getStatus());
        customer.setNotes(request.getNotes());
        customer.setReferredBy(request.getReferredBy());

        customer = customerRepository.save(customer);
        return toDetailedProfileResponse(customer);
    }

    public CustomerProfileResponse getCustomerTimeline(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        CustomerProfileResponse profile = toDetailedProfileResponse(customer);
        List<CustomerProfileResponse.TimelineEvent> events = new ArrayList<>();

        // Add installation event
        if (customer.getInstallationDate() != null) {
            events.add(CustomerProfileResponse.TimelineEvent.builder()
                    .type("INSTALLATION")
                    .date(customer.getInstallationDate().atStartOfDay())
                    .title("Hair Extension Installed")
                    .description(customer.getHairExtensionType() != null ?
                            "Type: " + customer.getHairExtensionType() : "Hair extension installation")
                    .status("completed")
                    .build());
        }

        // Add sessions
        List<ServiceSession> sessions = sessionRepository.findByCustomerIdOrderBySessionDateDesc(id);
        for (ServiceSession session : sessions) {
            events.add(CustomerProfileResponse.TimelineEvent.builder()
                    .type("SESSION")
                    .date(session.getSessionDate())
                    .title(session.getServiceType() + " Session")
                    .description(session.getServiceDescription() != null ? session.getServiceDescription() : "")
                    .status(session.getStatus())
                    .serviceType(session.getServiceType())
                    .referenceId(session.getSessionId())
                    .build());
        }

        // Add orders
        List<Order> orders = orderRepository.findByCustomerIdOrderByCreatedAtDesc(id);
        for (Order order : orders) {
            events.add(CustomerProfileResponse.TimelineEvent.builder()
                    .type("ORDER")
                    .date(order.getCreatedAt())
                    .title("Purchase - " + order.getInvoiceNo())
                    .description("Amount: ₹" + order.getFinalAmount())
                    .status(order.getStatus())
                    .amount("₹" + order.getFinalAmount().toString())
                    .referenceId(order.getOrderId())
                    .build());
        }

        // Sort by date descending
        events.sort(Comparator.comparing(CustomerProfileResponse.TimelineEvent::getDate).reversed());
        profile.setTimeline(events);

        return profile;
    }

    private CustomerProfileResponse toProfileResponse(Customer customer) {
        long sessionCount = sessionRepository.findByCustomerIdOrderBySessionDateDesc(customer.getCustomerId()).size();
        long orderCount = orderRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getCustomerId()).size();

        return CustomerProfileResponse.builder()
                .customerId(customer.getCustomerId())
                .name(customer.getName())
                .phoneNumber(customer.getPhoneNumber())
                .email(customer.getEmail())
                .city(customer.getCity())
                .photoUrl(customer.getPhotoUrl())
                .hairExtensionType(customer.getHairExtensionType())
                .hairLength(customer.getHairLength())
                .installationDate(customer.getInstallationDate())
                .status(customer.getStatus())
                .lastVisitDate(customer.getLastVisitDate())
                .totalVisits(customer.getTotalVisits() != null ? customer.getTotalVisits() : 0)
                .totalSessions(sessionCount)
                .totalOrders(orderCount)
                .createdAt(customer.getCreatedAt())
                .build();
    }

    private CustomerProfileResponse toDetailedProfileResponse(Customer customer) {
        CustomerProfileResponse resp = toProfileResponse(customer);
        resp.setAddress(customer.getAddress());
        resp.setState(customer.getState());
        resp.setPincode(customer.getPincode());
        resp.setDateOfBirth(customer.getDateOfBirth());
        resp.setGender(customer.getGender());
        resp.setHairColor(customer.getHairColor());
        resp.setNotes(customer.getNotes());
        resp.setReferredBy(customer.getReferredBy());
        return resp;
    }
}
