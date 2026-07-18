package com.codeWithHimanshu.cravora.features.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class AdminDataInitializer implements CommandLineRunner {

    private final CityRepository cityRepository;
    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final RiderRepository riderRepository;
    private final AnnouncementRepository announcementRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Cities
        if (cityRepository.count() == 0) {
            cityRepository.saveAll(List.of(
                City.builder().name("Mumbai").state("Maharashtra").activeStatus(true).build(),
                City.builder().name("Pune").state("Maharashtra").activeStatus(true).build(),
                City.builder().name("Delhi").state("NCR").activeStatus(true).build(),
                City.builder().name("Bangalore").state("Karnataka").activeStatus(true).build()
            ));
        }

        // 2. Seed Categories
        if (categoryRepository.count() == 0) {
            categoryRepository.saveAll(List.of(
                Category.builder().name("Biryani").icon("🍲").build(),
                Category.builder().name("Pizza").icon("🍕").build(),
                Category.builder().name("Burgers").icon("🍔").build(),
                Category.builder().name("Desserts").icon("🍰").build(),
                Category.builder().name("Chinese").icon("🍜").build(),
                Category.builder().name("Drinks").icon("🥤").build()
            ));
        }

        // 3. Seed Restaurants
        if (restaurantRepository.count() == 0) {
            restaurantRepository.saveAll(List.of(
                Restaurant.builder().name("The Biryani Junction").cuisineType("Indian").address("Bandra West, Mumbai").rating(4.7).activeStatus(true).commissionRate(15.0).build(),
                Restaurant.builder().name("Pizza Corner").cuisineType("Italian").address("Koramangala, Bangalore").rating(4.5).activeStatus(true).commissionRate(12.0).build(),
                Restaurant.builder().name("Spice Affair").cuisineType("Chinese").address("Connaught Place, Delhi").rating(4.3).activeStatus(true).commissionRate(15.0).build(),
                Restaurant.builder().name("Burger House").cuisineType("Fast Food").address("Kothrud, Pune").rating(4.4).activeStatus(true).commissionRate(10.0).build()
            ));
        }

        // 4. Seed Riders
        if (riderRepository.count() == 0) {
            riderRepository.saveAll(List.of(
                Rider.builder().name("Rohan Sharma").phone("9876543210").status("AVAILABLE").activeDeliveryCount(0).vehicleType("BIKE").build(),
                Rider.builder().name("Amit Patel").phone("9876543211").status("DELIVERING").activeDeliveryCount(1).vehicleType("SCOOTER").build(),
                Rider.builder().name("Vikram Singh").phone("9876543212").status("OFFLINE").activeDeliveryCount(0).vehicleType("CYCLE").build(),
                Rider.builder().name("Rahul Verma").phone("9876543213").status("AVAILABLE").activeDeliveryCount(0).vehicleType("BIKE").build()
            ));
        }

        // 5. Seed Announcements
        if (announcementRepository.count() == 0) {
            announcementRepository.saveAll(List.of(
                Announcement.builder()
                    .title("Free Delivery Weekend!")
                    .message("Enjoy free delivery on all orders above ₹200 this Saturday and Sunday. Offer applies automatically during checkout!")
                    .timestamp(LocalDateTime.now().minusDays(1))
                    .build(),
                Announcement.builder()
                    .title("Introducing Digital Wallet system")
                    .message("Now you can add funds to your Cravora digital wallet for faster checkouts and split payments! Get ₹1000 default balance upon logging in.")
                    .timestamp(LocalDateTime.now().minusHours(2))
                    .build()
            ));
        }
    }
}
