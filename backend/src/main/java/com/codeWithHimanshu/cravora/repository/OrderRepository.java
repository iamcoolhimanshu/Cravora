package com.codeWithHimanshu.cravora.repository;

import com.codeWithHimanshu.cravora.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
}
