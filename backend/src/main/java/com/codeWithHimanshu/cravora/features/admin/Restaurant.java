package com.codeWithHimanshu.cravora.features.admin;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurants")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String cuisineType;
    private double rating;
    private boolean activeStatus;
    private double commissionRate; // e.g. 0.15 for 15%
}
