package com.speedbilling.service;

import com.speedbilling.dto.request.AppointmentRequest;
import com.speedbilling.dto.response.AppointmentResponse;
import com.speedbilling.entity.*;
import com.speedbilling.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public List<AppointmentResponse> getAppointmentsByDate(LocalDate date) {
        return appointmentRepository.findByAppointmentDate(date).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByDateRange(LocalDate start, LocalDate end) {
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(LocalTime.MAX);
        return appointmentRepository.findByAppointmentDateBetween(startDateTime, endDateTime).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsByCustomer(Long customerId) {
        return appointmentRepository.findByCustomerIdOrderByAppointmentDateDesc(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Appointment appointment = Appointment.builder()
                .customerId(request.getCustomerId())
                .appointmentDate(request.getAppointmentDate())
                .endTime(request.getEndTime())
                .serviceType(request.getServiceType())
                .serviceDescription(request.getServiceDescription())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 60)
                .status(request.getStatus() != null ? request.getStatus() : "scheduled")
                .notes(request.getNotes())
                .assignedTo(request.getAssignedTo())
                .build();

        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentRequest request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));

        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setEndTime(request.getEndTime());
        appointment.setServiceType(request.getServiceType());
        appointment.setServiceDescription(request.getServiceDescription());
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setNotes(request.getNotes());
        appointment.setAssignedTo(request.getAssignedTo());
        if (request.getStatus() != null) appointment.setStatus(request.getStatus());

        appointment = appointmentRepository.save(appointment);
        return toResponse(appointment);
    }

    @Transactional
    public void updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id: " + id));
        appointment.setStatus(status);
        appointmentRepository.save(appointment);
    }

    @Transactional
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        String customerName = "";
        String customerPhone = "";
        try {
            Customer customer = customerRepository.findById(appointment.getCustomerId()).orElse(null);
            if (customer != null) {
                customerName = customer.getName();
                customerPhone = customer.getPhoneNumber();
            }
        } catch (Exception ignored) {}

        String assignedToName = "";
        if (appointment.getAssignedTo() != null) {
            try {
                assignedToName = userRepository.findById(appointment.getAssignedTo())
                        .map(User::getUsername).orElse("");
            } catch (Exception ignored) {}
        }

        return AppointmentResponse.builder()
                .appointmentId(appointment.getAppointmentId())
                .customerId(appointment.getCustomerId())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .appointmentDate(appointment.getAppointmentDate())
                .endTime(appointment.getEndTime())
                .serviceType(appointment.getServiceType())
                .serviceDescription(appointment.getServiceDescription())
                .durationMinutes(appointment.getDurationMinutes())
                .status(appointment.getStatus())
                .notes(appointment.getNotes())
                .reminderSent(appointment.getReminderSent() != null && appointment.getReminderSent())
                .assignedToName(assignedToName)
                .createdAt(appointment.getCreatedAt())
                .build();
    }
}
