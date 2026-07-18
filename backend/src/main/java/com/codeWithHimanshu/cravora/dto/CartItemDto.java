package com.codeWithHimanshu.cravora.dto;

import com.codeWithHimanshu.cravora.entity.FoodItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemDto {
    private Long id;
    private Long userId;
    private Long foodId;
    private int quantity;
    private FoodItem food;
}
