package com.codeWithHimanshu.cravora.features.offer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferRepository offerRepository;

    @GetMapping
    public ResponseEntity<List<Offer>> getAllOffers() {
        return ResponseEntity.ok(offerRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Offer> createOffer(@RequestBody Offer offer) {
        // Ensure coupon code is saved in uppercase
        if (offer.getCode() != null) {
            offer.setCode(offer.getCode().toUpperCase().trim());
        }
        return ResponseEntity.ok(offerRepository.save(offer));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOffer(@PathVariable Long id) {
        offerRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Offer deleted successfully"));
    }
}
