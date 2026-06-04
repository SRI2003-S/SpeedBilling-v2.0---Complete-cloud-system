package com.speedbilling.service;

import com.speedbilling.dto.response.DashboardWidgetResponse;
import com.speedbilling.entity.*;
import com.speedbilling.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ServiceSessionRepository sessionRepository;
    private final CustomerRepository customerRepository;
    private final AppointmentRepository appointmentRepository;
    private final ShiftManagementRepository shiftRepository;
    private final OrderRepository orderRepository;

    public DashboardWidgetResponse getOwnerDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate weekEnd = today.plusDays(7);
        LocalDate monthStart = today.withDayOfMonth(1);

        // Session counts
        long todaySessions = sessionRepository.findBySessionDate(today).size();
        long tomorrowSessions = sessionRepository.findBySessionDate(tomorrow).size();
        long weekSessions = sessionRepository.countByNextSessionDateBetween(today, weekEnd);
        long overdueSessions = sessionRepository.countOverdueSessions(today);
        long missedSessions = sessionRepository.countByStatus("missed");

        // Follow-up due: customers with sessions due in next 7 days
        long followUpDue = sessionRepository.countByNextSessionDateBetween(today, weekEnd);

        // Recent sessions
        List<ServiceSession> recentSessions = sessionRepository.findByStatusOrderBySessionDateDesc("completed");
        List<DashboardWidgetResponse.SessionSummary> sessionSummaries = recentSessions.stream()
                .limit(5)
                .map(s -> {
                    String customerName = "";
                    try {
                        customerName = customerRepository.findById(s.getCustomerId())
                                .map(Customer::getName).orElse("");
                    } catch (Exception ignored) {}
                    return DashboardWidgetResponse.SessionSummary.builder()
                            .sessionId(s.getSessionId())
                            .customerName(customerName)
                            .serviceType(s.getServiceType())
                            .sessionDate(s.getSessionDate() != null ? s.getSessionDate().toString() : "")
                            .status(s.getStatus())
                            .build();
                })
                .collect(Collectors.toList());

        // Customers due today
        List<ServiceSession> dueToday = sessionRepository.findByNextSessionDate(today);
        List<DashboardWidgetResponse.CustomerSummary> dueTodayCustomers = dueToday.stream()
                .limit(10)
                .map(s -> buildCustomerSummary(s.getCustomerId(), today.toString()))
                .collect(Collectors.toList());

        // Overdue customers
        List<ServiceSession> overdueList = sessionRepository.findOverdueSessions(today);
        List<DashboardWidgetResponse.CustomerSummary> overdueCustomers = overdueList.stream()
                .limit(10)
                .map(s -> buildCustomerSummary(s.getCustomerId(), s.getNextSessionDate() != null ?
                        s.getNextSessionDate().toString() : ""))
                .collect(Collectors.toList());

        // Current shift info
        DashboardWidgetResponse.ShiftSummary shiftSummary = null;
        try {
            ShiftManagement activeShift = shiftRepository.findByUserIdAndStatusTrue(1L).orElse(null);
            if (activeShift != null) {
                shiftSummary = DashboardWidgetResponse.ShiftSummary.builder()
                        .shiftId(activeShift.getShiftId())
                        .startTime(activeShift.getStartTime().toString())
                        .status(activeShift.getStatus() ? "Active" : "Closed")
                        .build();
            }
        } catch (Exception ignored) {}

        return DashboardWidgetResponse.builder()
                .todaySessions(todaySessions)
                .tomorrowSessions(tomorrowSessions)
                .weekSessions(weekSessions)
                .overdueCustomers(overdueSessions)
                .missedSessions(missedSessions)
                .followUpDue(followUpDue)
                .recentSessions(sessionSummaries)
                .dueTodayCustomers(dueTodayCustomers)
                .overdueCustomersList(overdueCustomers)
                .currentShift(shiftSummary)
                .build();
    }

    private DashboardWidgetResponse.CustomerSummary buildCustomerSummary(Long customerId, String nextSessionDate) {
        try {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer != null) {
                return DashboardWidgetResponse.CustomerSummary.builder()
                        .customerId(customer.getCustomerId())
                        .name(customer.getName())
                        .phone(customer.getPhoneNumber())
                        .lastVisit(customer.getLastVisitDate() != null ?
                                customer.getLastVisitDate().toLocalDate().toString() : "")
                        .nextSessionDate(nextSessionDate)
                        .hairExtensionType(customer.getHairExtensionType())
                        .build();
            }
        } catch (Exception ignored) {}
        return DashboardWidgetResponse.CustomerSummary.builder()
                .customerId(customerId)
                .name("Unknown")
                .build();
    }
}
