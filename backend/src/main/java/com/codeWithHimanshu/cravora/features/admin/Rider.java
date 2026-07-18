package com.codeWithHimanshu.cravora.features.admin;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "riders")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Rider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String phone;
    private String status; // AVAILABLE, DELIVERING, OFFLINE
    private int activeDeliveryCount;
    private String vehicleType; // BIKE, CYCLE, SCOOTER
}
