package com.codeWithHimanshu.cravora.controller;

import com.codeWithHimanshu.cravora.entity.CartItem;
import com.codeWithHimanshu.cravora.entity.FoodItem;
import com.codeWithHimanshu.cravora.dto.CartItemDto;
import com.codeWithHimanshu.cravora.service.CartService;
import com.codeWithHimanshu.cravora.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final FoodService foodService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<CartItemDto>> viewCart(@PathVariable Long userId) {
        return ResponseEntity.ok(getCartItemDtos(userId));
    }

    @PostMapping("/{userId}/add/{productId}")
    public ResponseEntity<List<CartItemDto>> addToCart(@PathVariable Long userId,
                                                        @PathVariable Long productId) {
        cartService.addToCart(userId, productId);
        return ResponseEntity.ok(getCartItemDtos(userId));
    }

    @DeleteMapping("/remove/{id}/{userId}")
    public ResponseEntity<List<CartItemDto>> remove(@PathVariable Long id, @PathVariable Long userId) {
        cartService.removeItem(id);
        return ResponseEntity.ok(getCartItemDtos(userId));
    }

    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<List<CartItemDto>> clear(@PathVariable Long userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(getCartItemDtos(userId));
    }

    private List<CartItemDto> getCartItemDtos(Long userId) {
        List<CartItem> items = cartService.getUserCart(userId);
        return items.stream().map(item -> {
            FoodItem food = null;
            try {
                food = foodService.getFoodById(item.getFoodId());
            } catch (Exception e) {
                // Ignore if food item was deleted
            }
            return new CartItemDto(item.getId(), item.getUserId(), item.getFoodId(), item.getQuantity(), food);
        }).toList();
    }
}
