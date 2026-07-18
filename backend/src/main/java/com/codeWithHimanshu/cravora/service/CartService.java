package com.codeWithHimanshu.cravora.service;

import com.codeWithHimanshu.cravora.entity.CartItem;

import java.util.List;

public interface CartService {

    CartItem addToCart(Long userId, Long foodId);

    List<CartItem> getUserCart(Long userId);

    void removeItem(Long cartItemId);

    void clearCart(Long userId);
}
