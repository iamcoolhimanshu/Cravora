package com.codeWithHimanshu.cravora.service.impl;

import com.codeWithHimanshu.cravora.entity.FoodItem;
import com.codeWithHimanshu.cravora.repository.FoodItemRepository;
import com.codeWithHimanshu.cravora.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FoodServiceImpl implements FoodService {

    private final FoodItemRepository foodRepo;

    @Override
    public FoodItem saveFood(FoodItem foodItem) {
        return foodRepo.save(foodItem);
    }

    @Override
    public FoodItem updateFood(Long id, FoodItem updated) {
        FoodItem food = foodRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found!"));

        food.setName(updated.getName());
        food.setDescription(updated.getDescription());
        food.setPrice(updated.getPrice());
        food.setImageUrl(updated.getImageUrl());

        return foodRepo.save(food);
    }

    @Override
    public void deleteFood(Long id) {
        foodRepo.deleteById(id);
    }

    @Override
    public FoodItem getFoodById(Long id) {
        return foodRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Food not found"));
    }

    @Override
    public List<FoodItem> getAllFoods() {
        return foodRepo.findAll();
    }
}
