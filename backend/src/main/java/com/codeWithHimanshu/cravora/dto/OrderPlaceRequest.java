package com.codeWithHimanshu.cravora.dto;

import lombok.Data;

@Data
public class OrderPlaceRequest {
    private Long userId;
    private String orderType;       // INSTANT, SCHEDULED, REPEAT, GROUP, BULK, CORPORATE
    private String scheduledTime;   // date-time string
    private String paymentMethod;   // UPI, CARD, NET_BANKING, WALLET, COD, SPLIT
    private String paymentStatus;   // COMPLETED, FAILED, PENDING
    private double walletAmountPaid;
    private double otherAmountPaid;
    private String corporateName;
    private String groupOrderId;
    private String notes;
}
