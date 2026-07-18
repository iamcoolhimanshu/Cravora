package com.codeWithHimanshu.cravora.features.admin;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cities")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String state;
    private boolean activeStatus;
}
