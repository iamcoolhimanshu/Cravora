package com.codeWithHimanshu.cravora.features.delivery;

import com.codeWithHimanshu.cravora.entity.Order;
import com.codeWithHimanshu.cravora.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/delivery")
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final OrderService orderService;

    @GetMapping("/orders")
    public ResponseEntity<List<Order>> getDeliveryOrders() {
        List<Order> orders = orderService.getAllOrders().stream()
                .filter(order -> !"DELIVERED".equals(order.getStatus()))
                .toList();
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<Order> updateDeliveryStatus(@PathVariable Long id, @RequestParam String status) {
        Order order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }
}
