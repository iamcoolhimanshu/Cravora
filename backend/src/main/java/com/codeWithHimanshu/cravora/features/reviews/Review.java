package com.codeWithHimanshu.cravora.features.reviews;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reviews")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long foodId;
    private String userName;
    
    @Column(length = 1000)
    private String content;
    
    private int rating; // 1-5 stars
    private int likes;  // Helpful votes count
    
    @Column(length = 1000)
    private String restaurantReply;
    
    private String mediaUrl; // Photo or video URL simulation
}
