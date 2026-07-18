package com.codeWithHimanshu.cravora.features.support;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "support_tickets")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String userName;
    private String description;
    private String status; // "OPEN", "RESOLVED"
    private boolean refundRequested;
    private double refundAmount;
}
