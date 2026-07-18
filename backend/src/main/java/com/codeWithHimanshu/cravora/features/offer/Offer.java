package com.codeWithHimanshu.cravora.features.offer;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "offers")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    
    @Column(unique = true, nullable = false)
    private String code;
    
    private double discount;
    private String tag;
    private String icon;
}
