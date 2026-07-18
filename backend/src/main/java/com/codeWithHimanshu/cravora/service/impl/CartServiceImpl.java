package com.codeWithHimanshu.cravora.service.impl;

import com.codeWithHimanshu.cravora.entity.CartItem;
import com.codeWithHimanshu.cravora.repository.CartItemRepository;
import com.codeWithHimanshu.cravora.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartRepo;

    @Override
    public CartItem addToCart(Long userId, Long foodId) {
        CartItem item = CartItem.builder()
                .userId(userId)
                .foodId(foodId)
                .quantity(1)
                .build();
        return cartRepo.save(item);
    }

    @Override
    public List<CartItem> getUserCart(Long userId) {
        return cartRepo.findByUserId(userId);
    }

    @Override
    public void removeItem(Long cartItemId) {
        cartRepo.deleteById(cartItemId);
    }

    @Override
    public void clearCart(Long userId) {
        cartRepo.findByUserId(userId).forEach(item -> cartRepo.deleteById(item.getId()));
    }
}
