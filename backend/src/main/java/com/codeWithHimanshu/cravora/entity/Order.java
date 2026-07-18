package com.codeWithHimanshu.cravora.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "orders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @Column(length = 800)
    private String items;

    private double totalAmount;

    private String status;

    private String orderType;

    private String scheduledTime;

    private String paymentMethod;

    private String paymentStatus;

    private double walletAmountPaid;

    private double otherAmountPaid;

    private String corporateName;

    private String groupOrderId;

    private String notes;
}
