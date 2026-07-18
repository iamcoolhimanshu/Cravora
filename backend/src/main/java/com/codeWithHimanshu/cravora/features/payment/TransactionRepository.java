package com.codeWithHimanshu.cravora.features.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUserIdOrderByTimestampDesc(Long userId);
}
