package com.codeWithHimanshu.cravora.dto;

import lombok.Data;

@Data
public class OrderItemDto {
    private Long foodId;
    private String foodName;
    private int quantity;
    private double price;
}
