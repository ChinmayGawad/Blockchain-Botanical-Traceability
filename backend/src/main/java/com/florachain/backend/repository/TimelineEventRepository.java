package com.florachain.backend.repository;

import com.florachain.backend.entity.TimelineEventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimelineEventRepository extends JpaRepository<TimelineEventEntity, String> {
    List<TimelineEventEntity> findByProductIdOrderByTimestampAsc(String productId);
}
