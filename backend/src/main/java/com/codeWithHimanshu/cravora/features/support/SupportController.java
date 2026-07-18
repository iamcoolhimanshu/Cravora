package com.codeWithHimanshu.cravora.features.support;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
public class SupportController {

    private final SupportTicketRepository supportTicketRepository;

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket ticket) {
        ticket.setStatus("OPEN");
        return ResponseEntity.ok(supportTicketRepository.save(ticket));
    }

    @GetMapping("/tickets/user/{userId}")
    public ResponseEntity<List<SupportTicket>> getUserTickets(@PathVariable Long userId) {
        return ResponseEntity.ok(supportTicketRepository.findByUserId(userId));
    }

    @GetMapping("/tickets/all")
    public ResponseEntity<List<SupportTicket>> getAllTickets() {
        return ResponseEntity.ok(supportTicketRepository.findAll());
    }

    @PostMapping("/tickets/{id}/resolve")
    public ResponseEntity<SupportTicket> resolveTicket(@PathVariable Long id) {
        SupportTicket ticket = supportTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus("RESOLVED");
        return ResponseEntity.ok(supportTicketRepository.save(ticket));
    }
}
