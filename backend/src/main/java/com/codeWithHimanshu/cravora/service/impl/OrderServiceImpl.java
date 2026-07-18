package com.codeWithHimanshu.cravora.service.impl;

import com.codeWithHimanshu.cravora.entity.CartItem;
import com.codeWithHimanshu.cravora.entity.Order;
import com.codeWithHimanshu.cravora.entity.User;
import com.codeWithHimanshu.cravora.entity.FoodItem;
import com.codeWithHimanshu.cravora.dto.OrderPlaceRequest;
import com.codeWithHimanshu.cravora.repository.CartItemRepository;
import com.codeWithHimanshu.cravora.repository.OrderRepository;
import com.codeWithHimanshu.cravora.repository.UserRepository;
import com.codeWithHimanshu.cravora.repository.FoodItemRepository;
import com.codeWithHimanshu.cravora.features.payment.Transaction;
import com.codeWithHimanshu.cravora.features.payment.TransactionRepository;
import com.codeWithHimanshu.cravora.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final CartItemRepository cartRepo;
    private final OrderRepository orderRepo;
    private final UserRepository userRepo;
    private final FoodItemRepository foodRepo;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional
    public Order placeOrder(OrderPlaceRequest request) {
        List<CartItem> cartItems = cartRepo.findByUserId(request.getUserId());

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Calculate total amount based on cart items (using actual prices)
        double calculatedTotal = 0.0;
        StringBuilder itemListBuilder = new StringBuilder();
        for (CartItem i : cartItems) {
            FoodItem food = foodRepo.findById(i.getFoodId()).orElse(null);
            double price = 100.0; // fallback
            if (food != null) {
                price = food.getPrice();
                itemListBuilder.append("FoodID:").append(i.getFoodId())
                               .append(" Qty:").append(i.getQuantity()).append(", ");
            } else {
                itemListBuilder.append("FoodID:").append(i.getFoodId())
                               .append(" Qty:").append(i.getQuantity()).append(", ");
            }
            calculatedTotal += price * i.getQuantity();
        }

        // Apply bulk or corporate discounts
        if ("BULK".equalsIgnoreCase(request.getOrderType())) {
            calculatedTotal *= 0.85; // 15% discount
        } else if ("CORPORATE".equalsIgnoreCase(request.getOrderType())) {
            calculatedTotal *= 0.90; // 10% discount
        }

        // Final total amount to charge
        double total = request.getWalletAmountPaid() + request.getOtherAmountPaid();
        if (total <= 0.0) {
            total = calculatedTotal;
        }

        User user = userRepo.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Process wallet payment if applicable
        if (request.getWalletAmountPaid() > 0) {
            if (user.getWalletBalance() < request.getWalletAmountPaid()) {
                throw new RuntimeException("Insufficient wallet balance");
            }
            user.setWalletBalance(user.getWalletBalance() - request.getWalletAmountPaid());
            userRepo.save(user);
        }

        // Determine status based on order type and payment status
        String orderStatus = "PENDING";
        if ("SCHEDULED".equalsIgnoreCase(request.getOrderType())) {
            orderStatus = "SCHEDULED";
        }
        if ("FAILED".equalsIgnoreCase(request.getPaymentStatus())) {
            orderStatus = "PAYMENT_FAILED";
        }

        Order order = Order.builder()
                .userId(request.getUserId())
                .items(itemListBuilder.toString())
                .totalAmount(total)
                .status(orderStatus)
                .orderType(request.getOrderType() != null ? request.getOrderType().toUpperCase() : "INSTANT")
                .scheduledTime(request.getScheduledTime())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus().toUpperCase() : "COMPLETED")
                .walletAmountPaid(request.getWalletAmountPaid())
                .otherAmountPaid(request.getOtherAmountPaid())
                .corporateName(request.getCorporateName())
                .groupOrderId(request.getGroupOrderId())
                .notes(request.getNotes())
                .build();

        Order savedOrder = orderRepo.save(order);

        // Delete items from cart
        cartRepo.deleteAll(cartItems);

        // Record the transaction
        Transaction tx = Transaction.builder()
                .userId(user.getId())
                .orderId(savedOrder.getId())
                .amount(total)
                .paymentMethod(request.getPaymentMethod())
                .type("PAYMENT")
                .status("FAILED".equalsIgnoreCase(request.getPaymentStatus()) ? "FAILED" : "SUCCESS")
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);

        return savedOrder;
    }

    @Override
    @Transactional
    public Order repeatLastOrder(Long userId) {
        List<Order> orders = orderRepo.findByUserId(userId);
        if (orders.isEmpty()) {
            throw new RuntimeException("No previous orders found to repeat");
        }

        Order lastOrder = orders.stream()
                .max((o1, o2) -> o1.getId().compareTo(o2.getId()))
                .get();

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double walletPaid = lastOrder.getWalletAmountPaid();
        if (walletPaid > 0) {
            if (user.getWalletBalance() < walletPaid) {
                throw new RuntimeException("Insufficient wallet balance to repeat this order");
            }
            user.setWalletBalance(user.getWalletBalance() - walletPaid);
            userRepo.save(user);
        }

        Order newOrder = Order.builder()
                .userId(userId)
                .items(lastOrder.getItems())
                .totalAmount(lastOrder.getTotalAmount())
                .status("PENDING")
                .orderType("REPEAT")
                .paymentMethod(lastOrder.getPaymentMethod())
                .paymentStatus(lastOrder.getPaymentStatus())
                .walletAmountPaid(walletPaid)
                .otherAmountPaid(lastOrder.getOtherAmountPaid())
                .corporateName(lastOrder.getCorporateName())
                .groupOrderId(lastOrder.getGroupOrderId())
                .notes("Repeat of Order #" + lastOrder.getId())
                .build();

        Order savedOrder = orderRepo.save(newOrder);

        // Record the transaction
        Transaction tx = Transaction.builder()
                .userId(userId)
                .orderId(savedOrder.getId())
                .amount(savedOrder.getTotalAmount())
                .paymentMethod(savedOrder.getPaymentMethod())
                .type("PAYMENT")
                .status("SUCCESS")
                .timestamp(LocalDateTime.now())
                .build();
        transactionRepository.save(tx);

        return savedOrder;
    }

    @Override
    public List<Order> getOrdersByUserId(Long userId) {
        return orderRepo.findByUserId(userId);
    }

    @Override
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }

    @Override
    @Transactional
    public Order updateOrderStatus(Long id, String status) {
        Order order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found!"));

        String oldStatus = order.getStatus();
        order.setStatus(status);

        Order saved = orderRepo.save(order);

        // Refund trigger if order changes to CANCELLED or REFUNDED and it was paid successfully
        if (("CANCELLED".equalsIgnoreCase(status) || "REFUNDED".equalsIgnoreCase(status))
                && !"CANCELLED".equalsIgnoreCase(oldStatus) && !"REFUNDED".equalsIgnoreCase(oldStatus)) {

            if ("COMPLETED".equalsIgnoreCase(order.getPaymentStatus()) || "SUCCESS".equalsIgnoreCase(order.getPaymentStatus())) {
                double refundAmount = order.getTotalAmount();
                if (refundAmount > 0) {
                    User user = userRepo.findById(order.getUserId()).orElse(null);
                    if (user != null) {
                        user.setWalletBalance(user.getWalletBalance() + refundAmount);
                        userRepo.save(user);

                        // Save transaction history
                        Transaction tx = Transaction.builder()
                                .userId(user.getId())
                                .orderId(order.getId())
                                .amount(refundAmount)
                                .paymentMethod("WALLET")
                                .type("REFUND")
                                .status("SUCCESS")
                                .timestamp(LocalDateTime.now())
                                .build();
                        transactionRepository.save(tx);

                        order.setPaymentStatus("REFUNDED");
                        orderRepo.save(order);
                    }
                }
            }
        }
        return saved;
    }
}
