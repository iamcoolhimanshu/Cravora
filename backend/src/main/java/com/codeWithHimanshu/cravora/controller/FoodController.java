package com.codeWithHimanshu.cravora.controller;

import com.codeWithHimanshu.cravora.entity.FoodItem;
import com.codeWithHimanshu.cravora.service.FileStorageService;
import com.codeWithHimanshu.cravora.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService foodService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<List<FoodItem>> listFoods() {
        return ResponseEntity.ok(foodService.getAllFoods());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItem> getFood(@PathVariable Long id) {
        return ResponseEntity.ok(foodService.getFoodById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FoodItem> saveFood(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        FoodItem foodItem = new FoodItem();
        foodItem.setName(name);
        foodItem.setDescription(description);
        foodItem.setPrice(price);

        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = fileStorageService.saveFile(imageFile);
            foodItem.setImageUrl(imagePath);
        }

        FoodItem saved = foodService.saveFood(foodItem);
        return ResponseEntity.ok(saved);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FoodItem> updateFood(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") double price,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {

        FoodItem foodItem = foodService.getFoodById(id);
        foodItem.setName(name);
        foodItem.setDescription(description);
        foodItem.setPrice(price);

        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = fileStorageService.saveFile(imageFile);
            foodItem.setImageUrl(imagePath);
        }

        FoodItem updated = foodService.updateFood(id, foodItem);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFood(@PathVariable Long id) {
        foodService.deleteFood(id);
        return ResponseEntity.ok(Map.of("message", "Food item deleted successfully"));
    }
}
