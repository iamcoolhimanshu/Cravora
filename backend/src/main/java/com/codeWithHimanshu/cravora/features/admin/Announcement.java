package com.codeWithHimanshu.cravora.features.admin;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "announcements")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(length = 1000)
    private String message;
    
    private LocalDateTime timestamp;
}
