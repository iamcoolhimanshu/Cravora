package com.codeWithHimanshu.cravora.features.offer;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferRepository extends JpaRepository<Offer, Long> {
    Offer findByCode(String code);
}
