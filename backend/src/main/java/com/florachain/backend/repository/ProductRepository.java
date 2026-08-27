package com.florachain.backend.repository;

import com.florachain.backend.entity.ProductEntity;
import com.florachain.backend.enums.ProductCategory;
import com.florachain.backend.enums.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, String> {
    Optional<ProductEntity> findByBatchId(String batchId);

    @Query("SELECT p FROM ProductEntity p WHERE p.id = :idOrBatch OR p.batchId = :idOrBatch")
    Optional<ProductEntity> findByIdOrBatchId(@Param("idOrBatch") String idOrBatch);

    List<ProductEntity> findByStatus(ProductStatus status);

    List<ProductEntity> findByFarmerId(String farmerId);

    List<ProductEntity> findByCategory(ProductCategory category);

    @Query("SELECT p FROM ProductEntity p WHERE " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.botanicalName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.batchId) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ProductEntity> searchProducts(@Param("query") String query);
}
