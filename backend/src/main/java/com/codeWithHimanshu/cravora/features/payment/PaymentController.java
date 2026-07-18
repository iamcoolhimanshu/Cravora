package com.codeWithHimanshu.cravora.features.payment;

import com.codeWithHimanshu.cravora.entity.Order;
import com.codeWithHimanshu.cravora.entity.User;
import com.codeWithHimanshu.cravora.repository.OrderRepository;
import com.codeWithHimanshu.cravora.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/history/{userId}")
    public ResponseEntity<List<Transaction>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(transactionRepository.findByUserIdOrderByTimestampDesc(userId));
    }

    @PostMapping("/wallet/add")
    @Transactional
    public ResponseEntity<?> addWalletBalance(@RequestBody WalletAddRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getAmount() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Amount must be positive"));
        }

        user.setWalletBalance(user.getWalletBalance() + request.getAmount());
        userRepository.save(user);

        Transaction tx = Transaction.builder()
                .userId(user.getId())
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "UPI")
                .type("WALLET_ADD")
                .status("SUCCESS")
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/retry/{orderId}")
    @Transactional
    public ResponseEntity<?> retryPayment(@PathVariable Long orderId, @RequestBody PaymentRetryRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PAYMENT_FAILED".equalsIgnoreCase(order.getStatus()) && !"FAILED".equalsIgnoreCase(order.getPaymentStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "This order does not need payment retry"));
        }

        User user = userRepository.findById(order.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If retrying via wallet (or split wallet)
        double walletToDeduct = request.getWalletAmountPaid();
        if (walletToDeduct > 0) {
            if (user.getWalletBalance() < walletToDeduct) {
                return ResponseEntity.badRequest().body(Map.of("error", "Insufficient wallet balance"));
            }
            user.setWalletBalance(user.getWalletBalance() - walletToDeduct);
            userRepository.save(user);
        }

        order.setPaymentStatus("COMPLETED");
        order.setStatus("SCHEDULED".equalsIgnoreCase(order.getOrderType()) ? "SCHEDULED" : "PENDING");
        order.setPaymentMethod(request.getPaymentMethod());
        order.setWalletAmountPaid(request.getWalletAmountPaid());
        order.setOtherAmountPaid(request.getOtherAmountPaid());
        orderRepository.save(order);

        Transaction tx = Transaction.builder()
                .userId(user.getId())
                .orderId(order.getId())
                .amount(order.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .type("PAYMENT")
                .status("SUCCESS")
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);

        return ResponseEntity.ok(order);
    }

    @Data
    public static class WalletAddRequest {
        private Long userId;
        private double amount;
        private String paymentMethod;
    }

    @Data
    public static class PaymentRetryRequest {
        private String paymentMethod;
        private double walletAmountPaid;
        private double otherAmountPaid;
    }
}
