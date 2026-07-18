package com.codeWithHimanshu.cravora.repository;

import com.codeWithHimanshu.cravora.entity.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
}
