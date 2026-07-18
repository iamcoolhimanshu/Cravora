package com.codeWithHimanshu.cravora.repository;

import com.codeWithHimanshu.cravora.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);
}
