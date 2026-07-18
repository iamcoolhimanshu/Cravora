package com.codeWithHimanshu.cravora.features.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findAllByOrderByTimestampDesc();
}
