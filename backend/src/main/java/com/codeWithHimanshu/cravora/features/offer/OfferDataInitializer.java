package com.codeWithHimanshu.cravora.features.offer;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OfferDataInitializer implements CommandLineRunner {

    private final OfferRepository offerRepository;

    @Override
    public void run(String... args) throws Exception {
        if (offerRepository.count() == 0) {
            offerRepository.saveAll(List.of(
                Offer.builder()
                    .title("Flat 50% OFF")
                    .description("No minimum order value required.")
                    .code("CRAVE50")
                    .discount(0.50)
                    .tag("MOST POPULAR")
                    .icon("🎉")
                    .build(),
                Offer.builder()
                    .title("Save 70% Off")
                    .description("Valid on orders above ₹300.")
                    .code("CRAVE70")
                    .discount(0.70)
                    .tag("SUPER DEALS")
                    .icon("🍛")
                    .build(),
                Offer.builder()
                    .title("Flat ₹150 OFF")
                    .description("Valid on cards payment methods.")
                    .code("FESTIVE150")
                    .discount(0.35)
                    .tag("WEEKEND SPECIAL")
                    .icon("💳")
                    .build()
            ));
        }
    }
}
