package com.codeWithHimanshu.cravora.features.reviews;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    @GetMapping("/food/{foodId}")
    public ResponseEntity<List<Review>> getReviewsByFood(@PathVariable Long foodId) {
        return ResponseEntity.ok(reviewRepository.findByFoodId(foodId));
    }

    @PostMapping
    public ResponseEntity<Review> submitReview(@RequestBody Review review) {
        review.setLikes(0);
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Review> likeReview(@PathVariable Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setLikes(review.getLikes() + 1);
        return ResponseEntity.ok(reviewRepository.save(review));
    }

    @PostMapping("/{id}/reply")
    public ResponseEntity<Review> replyToReview(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        review.setRestaurantReply(body.get("reply"));
        return ResponseEntity.ok(reviewRepository.save(review));
    }
}
