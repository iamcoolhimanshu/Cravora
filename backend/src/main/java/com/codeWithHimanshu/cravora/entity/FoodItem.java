package com.codeWithHimanshu.cravora.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "food_items")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Food name cannot be empty")
    private String name;

    private String description;

    private double price;

    private String imageUrl;
}
