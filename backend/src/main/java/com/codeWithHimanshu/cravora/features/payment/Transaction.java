package com.codeWithHimanshu.cravora.features.payment;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private Long orderId;

    private double amount;

    private String paymentMethod; // UPI, CARD, NET_BANKING, WALLET, COD, SPLIT

    private String type; // PAYMENT, REFUND, WALLET_ADD

    private String status; // SUCCESS, FAILED

    private LocalDateTime timestamp;
}
