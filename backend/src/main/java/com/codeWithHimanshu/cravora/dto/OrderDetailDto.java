package com.codeWithHimanshu.cravora.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderDetailDto {
    private Long id;
    private Long userId;
    private List<OrderItemDto> items;
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
