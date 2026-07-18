package com.codeWithHimanshu.cravora.features.admin;

import com.codeWithHimanshu.cravora.entity.Order;
import com.codeWithHimanshu.cravora.entity.User;
import com.codeWithHimanshu.cravora.repository.OrderRepository;
import com.codeWithHimanshu.cravora.repository.UserRepository;
import com.codeWithHimanshu.cravora.features.payment.Transaction;
import com.codeWithHimanshu.cravora.features.payment.TransactionRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3467", "http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final TransactionRepository transactionRepository;
    private final RestaurantRepository restaurantRepository;
    private final RiderRepository riderRepository;
    private final CityRepository cityRepository;
    private final CategoryRepository categoryRepository;
    private final AnnouncementRepository announcementRepository;

    private static double globalCommissionRate = 15.0; // default 15% platform fee

    // --- USER MANAGEMENT ---
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPassword(null)); // clear hash
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{id}/role")
    @Transactional
    public ResponseEntity<?> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(role.toUpperCase());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    @Transactional
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    // --- RESTAURANT MANAGEMENT ---
    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @PostMapping("/restaurants")
    @Transactional
    public ResponseEntity<Restaurant> addRestaurant(@RequestBody Restaurant restaurant) {
        if (restaurant.getCommissionRate() <= 0) {
            restaurant.setCommissionRate(0.15); // default 15%
        }
        return ResponseEntity.ok(restaurantRepository.save(restaurant));
    }

    @PutMapping("/restaurants/{id}")
    @Transactional
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant details) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        restaurant.setName(details.getName());
        restaurant.setAddress(details.getAddress());
        restaurant.setCuisineType(details.getCuisineType());
        restaurant.setActiveStatus(details.isActiveStatus());
        restaurant.setCommissionRate(details.getCommissionRate());
        return ResponseEntity.ok(restaurantRepository.save(restaurant));
    }

    @DeleteMapping("/restaurants/{id}")
    @Transactional
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        restaurantRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Restaurant deleted successfully"));
    }

    // --- RIDER MANAGEMENT ---
    @GetMapping("/riders")
    public ResponseEntity<List<Rider>> getAllRiders() {
        return ResponseEntity.ok(riderRepository.findAll());
    }

    @PostMapping("/riders")
    @Transactional
    public ResponseEntity<Rider> addRider(@RequestBody Rider rider) {
        if (rider.getStatus() == null) {
            rider.setStatus("AVAILABLE");
        }
        return ResponseEntity.ok(riderRepository.save(rider));
    }

    @PutMapping("/riders/{id}")
    @Transactional
    public ResponseEntity<Rider> updateRider(@PathVariable Long id, @RequestBody Rider details) {
        Rider rider = riderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rider not found"));
        rider.setName(details.getName());
        rider.setPhone(details.getPhone());
        rider.setStatus(details.getStatus());
        rider.setVehicleType(details.getVehicleType());
        rider.setActiveDeliveryCount(details.getActiveDeliveryCount());
        return ResponseEntity.ok(riderRepository.save(rider));
    }

    @DeleteMapping("/riders/{id}")
    @Transactional
    public ResponseEntity<?> deleteRider(@PathVariable Long id) {
        riderRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Rider deleted successfully"));
    }

    // --- CITY MANAGEMENT ---
    @GetMapping("/cities")
    public ResponseEntity<List<City>> getAllCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    @PostMapping("/cities")
    @Transactional
    public ResponseEntity<City> addCity(@RequestBody City city) {
        city.setActiveStatus(true);
        return ResponseEntity.ok(cityRepository.save(city));
    }

    @PutMapping("/cities/{id}")
    @Transactional
    public ResponseEntity<City> updateCity(@PathVariable Long id, @RequestBody City details) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("City not found"));
        city.setName(details.getName());
        city.setState(details.getState());
        city.setActiveStatus(details.isActiveStatus());
        return ResponseEntity.ok(cityRepository.save(city));
    }

    @DeleteMapping("/cities/{id}")
    @Transactional
    public ResponseEntity<?> deleteCity(@PathVariable Long id) {
        cityRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "City deleted successfully"));
    }

    // --- CATEGORIES ---
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping("/categories")
    @Transactional
    public ResponseEntity<Category> addCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/categories/{id}")
    @Transactional
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Category deleted successfully"));
    }

    // --- ANNOUNCEMENTS / NOTIFICATION CENTER ---
    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAllAnnouncements() {
        return ResponseEntity.ok(announcementRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping("/announcements")
    @Transactional
    public ResponseEntity<Announcement> postAnnouncement(@RequestBody Announcement announcement) {
        announcement.setTimestamp(LocalDateTime.now());
        return ResponseEntity.ok(announcementRepository.save(announcement));
    }

    @DeleteMapping("/announcements/{id}")
    @Transactional
    public ResponseEntity<?> deleteAnnouncement(@PathVariable Long id) {
        announcementRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Announcement deleted successfully"));
    }

    // --- COMMISSION & METRICS ---
    @GetMapping("/commission")
    public ResponseEntity<?> getCommissionMetrics() {
        List<Order> orders = orderRepository.findAll();
        double deliveredRevenue = orders.stream()
                .filter(o -> "DELIVERED".equalsIgnoreCase(o.getStatus()))
                .mapToDouble(Order::getTotalAmount)
                .sum();
        double commissionEarned = deliveredRevenue * (globalCommissionRate / 100);

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("globalCommissionRate", globalCommissionRate);
        metrics.put("totalDeliveredRevenue", deliveredRevenue);
        metrics.put("totalCommissionEarned", commissionEarned);
        metrics.put("totalRestaurants", restaurantRepository.count());
        return ResponseEntity.ok(metrics);
    }

    @PutMapping("/commission/global")
    public ResponseEntity<?> updateGlobalCommission(@RequestParam double rate) {
        globalCommissionRate = rate;
        return ResponseEntity.ok(Map.of("message", "Global commission rate updated to " + rate + "%"));
    }

    // --- TRANSACTIONS (PAYMENTS) LEDGER ---
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getAllTransactions() {
        return ResponseEntity.ok(transactionRepository.findAll());
    }

    // --- REFUND APPROVALS ---
    @GetMapping("/refunds/pending")
    public ResponseEntity<List<Order>> getPendingRefundOrders() {
        // Fetch all orders with status CANCELLED or REFUNDED to review
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> "CANCELLED".equalsIgnoreCase(o.getStatus()) || "REFUNDED".equalsIgnoreCase(o.getStatus()))
                .toList();
        return ResponseEntity.ok(orders);
    }
}
