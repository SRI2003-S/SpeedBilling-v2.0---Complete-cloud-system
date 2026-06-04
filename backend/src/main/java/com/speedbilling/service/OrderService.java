package com.speedbilling.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.speedbilling.dto.request.CreateOrderRequest;
import com.speedbilling.dto.response.OrderResponse;
import com.speedbilling.entity.*;
import com.speedbilling.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final BatchRepository batchRepository;
    private final ShiftManagementRepository shiftRepository;
    private final PaymentRepository paymentRepository;
    private final ActiveBillRepository activeBillRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Long userId) {
        // Find or create customer
        Customer customer = null;
        if (request.getCustomerPhone() != null && !request.getCustomerPhone().isEmpty()) {
            customer = customerRepository.findByPhoneNumber(request.getCustomerPhone())
                    .orElse(null);
        }
        if (customer == null) {
            customer = customerRepository.findByPhoneNumber("0").orElse(null);
            if (customer == null) {
                customer = Customer.builder()
                        .phoneNumber("0")
                        .name("Walk-in Customer")
                        .email("walkin@example.com")
                        .build();
                customer = customerRepository.save(customer);
            }
        }

        // Check active shift
        ShiftManagement shift = shiftRepository.findByUserIdAndStatusTrue(userId)
                .orElseThrow(() -> new RuntimeException("No active shift found"));

        // Generate invoice number
        String invoiceNo = "INV-" + Instant.now().getEpochSecond();

        // Create order
        Order order = Order.builder()
                .invoiceNo(invoiceNo)
                .customerId(customer.getCustomerId())
                .shiftId(shift.getShiftId())
                .totalAmountBeforeTax(request.getSubTotal() != null ? request.getSubTotal() : BigDecimal.ZERO)
                .taxAmount(BigDecimal.ZERO)
                .discountAmount(request.getDiscount() != null ? request.getDiscount() : BigDecimal.ZERO)
                .doctorName(request.getDoctorName())
                .finalAmount(request.getTotalAmount())
                .status("Paid")
                .notes(request.getNotes())
                .build();
        order = orderRepository.save(order);

        // Process items
        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            String itemName = itemReq.getName() != null ? itemReq.getName() : "Unknown";

            if (itemReq.isManual() || itemReq.getProductId() == null || itemReq.getProductId() == 0) {
                OrderItem item = OrderItem.builder()
                        .orderId(order.getOrderId())
                        .productId(0L)
                        .itemName(itemName)
                        .quantity(itemReq.getQty())
                        .unitPrice(itemReq.getPrice())
                        .totalPrice(itemReq.getPrice().multiply(BigDecimal.valueOf(itemReq.getQty())))
                        .build();
                orderItemRepository.save(item);
            } else {
                Batch batch = batchRepository.findById(itemReq.getBatchId())
                        .orElseThrow(() -> new RuntimeException("Batch not found: " + itemReq.getBatchId()));

                if (batch.getStocks() < itemReq.getQty()) {
                    throw new RuntimeException("Insufficient stock for batch: " + batch.getBatchCode());
                }

                batch.setStocks(batch.getStocks() - itemReq.getQty());
                batchRepository.save(batch);

                OrderItem item = OrderItem.builder()
                        .orderId(order.getOrderId())
                        .productId(itemReq.getProductId())
                        .batchId(itemReq.getBatchId())
                        .itemName(itemName)
                        .quantity(itemReq.getQty())
                        .unitPrice(itemReq.getPrice())
                        .totalPrice(itemReq.getPrice().multiply(BigDecimal.valueOf(itemReq.getQty())))
                        .build();
                orderItemRepository.save(item);
            }
        }

        // Process payment
        CreateOrderRequest.PaymentRequest payReq = request.getPaymentDetails();
        BigDecimal cash = payReq.getCash() != null ? payReq.getCash() : BigDecimal.ZERO;
        BigDecimal upi = payReq.getUpi() != null ? payReq.getUpi() : BigDecimal.ZERO;
        BigDecimal card = payReq.getCard() != null ? payReq.getCard() : BigDecimal.ZERO;
        BigDecimal totalPaid = cash.add(upi).add(card);
        BigDecimal excess = totalPaid.subtract(request.getTotalAmount()).max(BigDecimal.ZERO);

        Payment payment = Payment.builder()
                .orderId(order.getOrderId())
                .cash(cash.subtract(excess).max(BigDecimal.ZERO))
                .upi(upi)
                .card(card)
                .totalPaid(request.getTotalAmount())
                .excessAmount(excess)
                .upiTxnId(payReq.getUpiTxnId())
                .cardTxnId(payReq.getCardTxnId())
                .build();
        paymentRepository.save(payment);

        // Update customer visit
        customer.setTotalVisits(customer.getTotalVisits() != null ? customer.getTotalVisits() + 1 : 1);
        customer.setLastVisitDate(java.time.LocalDateTime.now());
        customerRepository.save(customer);

        return getOrderByInvoiceNo(invoiceNo);
    }

    public OrderResponse getOrderByInvoiceNo(String invoiceNo) {
        Order order = orderRepository.findByInvoiceNo(invoiceNo)
                .orElseThrow(() -> new RuntimeException("Order not found: " + invoiceNo));
        return toResponse(order);
    }

    public void saveActiveBill(Long userId, String billsData) {
        ActiveBill activeBill = activeBillRepository.findByUserId(userId)
                .orElse(ActiveBill.builder().userId(userId).build());
        activeBill.setBillsData(billsData);
        activeBill.setLastUpdated(java.time.LocalDateTime.now());
        activeBillRepository.save(activeBill);
    }

    public String getActiveBills(Long userId) {
        return activeBillRepository.findByUserId(userId)
                .map(ActiveBill::getBillsData)
                .orElse("[]");
    }

    private OrderResponse toResponse(Order order) {
        String customerName = "";
        String customerPhone = "";
        try {
            Customer customer = customerRepository.findById(order.getCustomerId()).orElse(null);
            if (customer != null) {
                customerName = customer.getName();
                customerPhone = customer.getPhoneNumber();
            }
        } catch (Exception ignored) {}

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getOrderId());
        List<OrderResponse.OrderItemResponse> itemResponses = items.stream()
                .map(i -> OrderResponse.OrderItemResponse.builder()
                        .itemName(i.getItemName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .totalPrice(i.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        Payment payment = paymentRepository.findByOrderId(order.getOrderId());
        OrderResponse.PaymentResponse paymentResponse = null;
        if (payment != null) {
            paymentResponse = OrderResponse.PaymentResponse.builder()
                    .cash(payment.getCash())
                    .upi(payment.getUpi())
                    .card(payment.getCard())
                    .totalPaid(payment.getTotalPaid())
                    .excessAmount(payment.getExcessAmount())
                    .build();
        }

        return OrderResponse.builder()
                .orderId(order.getOrderId())
                .invoiceNo(order.getInvoiceNo())
                .customerId(order.getCustomerId())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .subTotal(order.getTotalAmountBeforeTax())
                .discount(order.getDiscountAmount())
                .taxAmount(order.getTaxAmount())
                .finalAmount(order.getFinalAmount())
                .doctorName(order.getDoctorName())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .payment(paymentResponse)
                .build();
    }
}
