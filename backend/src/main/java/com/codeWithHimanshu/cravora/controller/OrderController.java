package com.codeWithHimanshu.cravora.controller;

import com.codeWithHimanshu.cravora.entity.Order;
import com.codeWithHimanshu.cravora.entity.FoodItem;
import com.codeWithHimanshu.cravora.dto.OrderDetailDto;
import com.codeWithHimanshu.cravora.dto.OrderItemDto;
import com.codeWithHimanshu.cravora.service.OrderService;
import com.codeWithHimanshu.cravora.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final FoodService foodService;

    @PostMapping("/place")
    public ResponseEntity<OrderDetailDto> placeOrder(@RequestBody com.codeWithHimanshu.cravora.dto.OrderPlaceRequest request) {
        Order order = orderService.placeOrder(request);
        return ResponseEntity.ok(toDetailDto(order));
    }

    @PostMapping("/repeat-last")
    public ResponseEntity<OrderDetailDto> repeatLastOrder(@RequestParam Long userId) {
        Order order = orderService.repeatLastOrder(userId);
        return ResponseEntity.ok(toDetailDto(order));
    }

    @GetMapping("/group/{groupOrderId}")
    public ResponseEntity<List<OrderDetailDto>> getGroupOrders(@PathVariable String groupOrderId) {
        List<Order> orders = orderService.getAllOrders().stream()
                .filter(o -> groupOrderId.equalsIgnoreCase(o.getGroupOrderId()))
                .toList();
        List<OrderDetailDto> dtos = orders.stream().map(this::toDetailDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDetailDto>> myOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        List<OrderDetailDto> dtos = orders.stream().map(this::toDetailDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderDetailDto>> allOrders() {
        List<Order> orders = orderService.getAllOrders();
        List<OrderDetailDto> dtos = orders.stream().map(this::toDetailDto).toList();
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<OrderDetailDto> updateStatus(@PathVariable Long id, @RequestParam String status) {
        Order order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(toDetailDto(order));
    }

    private OrderDetailDto toDetailDto(Order order) {
        OrderDetailDto dto = new OrderDetailDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setOrderType(order.getOrderType());
        dto.setScheduledTime(order.getScheduledTime());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setPaymentStatus(order.getPaymentStatus());
        dto.setWalletAmountPaid(order.getWalletAmountPaid());
        dto.setOtherAmountPaid(order.getOtherAmountPaid());
        dto.setCorporateName(order.getCorporateName());
        dto.setGroupOrderId(order.getGroupOrderId());
        dto.setNotes(order.getNotes());

        List<OrderItemDto> itemDtos = new java.util.ArrayList<>();
        String itemsStr = order.getItems();
        if (itemsStr != null && !itemsStr.isEmpty()) {
            String[] parts = itemsStr.split(",");
            for (String part : parts) {
                part = part.trim();
                if (part.isEmpty()) continue;
                try {
                    int foodIdIndex = part.indexOf("FoodID:");
                    int qtyIndex = part.indexOf(" Qty:");
                    if (foodIdIndex != -1 && qtyIndex != -1) {
                        long foodId = Long.parseLong(part.substring(foodIdIndex + 7, qtyIndex).trim());
                        int qty = Integer.parseInt(part.substring(qtyIndex + 5).trim());
                        FoodItem food = foodService.getFoodById(foodId);
                        OrderItemDto itemDto = new OrderItemDto();
                        itemDto.setFoodId(foodId);
                        itemDto.setQuantity(qty);
                        if (food != null) {
                            itemDto.setFoodName(food.getName());
                            itemDto.setPrice(food.getPrice());
                        } else {
                            itemDto.setFoodName("Unknown Item");
                            itemDto.setPrice(0.0);
                        }
                        itemDtos.add(itemDto);
                    }
                } catch (Exception e) {
                    // Ignore parse errors
                }
            }
        }
        dto.setItems(itemDtos);
        return dto;
    }
}
