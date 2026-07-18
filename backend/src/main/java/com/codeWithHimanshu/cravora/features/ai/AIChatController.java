package com.codeWithHimanshu.cravora.features.ai;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AIChatController {

	@PostMapping("/ask")
	public ResponseEntity<Map<String, String>> askChatbot(@RequestBody Map<String, String> body) {
		String question = body.getOrDefault("question", "").toLowerCase();
		String answer;

		if (question.contains("pizza")) {
			answer = "I highly recommend trying our gourmet Cheese Pizza! It's currently at 50% discount. You can search for 'Pizza' on the menu grid to add it directly to your cart!";
		} else if (question.contains("burger")) {
			answer = "Our Onion Burger with extra melted cheese is a best-seller! Perfect with a side of French Fries.";
		} else if (question.contains("biryani")) {
			answer = "Cravora's Royal Chicken Biryani is prepared with premium basmati rice and slow-cooked spices. Highly rated by 100+ local foodies!";
		} else if (question.contains("offer") || question.contains("coupon") || question.contains("discount")) {
			answer = "We have active discount promotions right now! Navigate to the 'Offers' tab to view codes like CRAVE50 (50% off) or CRAVE70 (70% off on orders above ₹300).";
		} else if (question.contains("delivery") || question.contains("status")) {
			answer = "Our average delivery time is under 30 minutes! You can track your active order status from the 'Orders' tab.";
		} else if (question.contains("refund")) {
			answer = "If you have any issues with your order, please open a support ticket under the Support Portal (Orders & Support section) and our team will credit you instantly.";
		} else {
			answer = "Hello! I am Cravora's AI assistant. Ask me anything about our gourmet dishes, pizza recommendations, active coupon offers, or order tracking!";
		}

		return ResponseEntity.ok(Map.of("answer", answer));
	}
}
