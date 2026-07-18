package com.codeWithHimanshu.cravora.service;

import com.codeWithHimanshu.cravora.entity.Order;
import com.codeWithHimanshu.cravora.dto.OrderPlaceRequest;

import java.util.List;

public interface OrderService {

    Order placeOrder(OrderPlaceRequest request);

    Order repeatLastOrder(Long userId);

    List<Order> getOrdersByUserId(Long userId);

    List<Order> getAllOrders();

    Order updateOrderStatus(Long id, String status);
}
