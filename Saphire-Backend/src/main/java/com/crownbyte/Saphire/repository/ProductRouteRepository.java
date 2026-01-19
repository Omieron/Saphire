package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.route.ProductRouteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRouteRepository extends JpaRepository<ProductRouteEntity, Long> {
    List<ProductRouteEntity> findByProductId(Long productId);

    List<ProductRouteEntity> findByProductIdAndActiveTrue(Long productId);

    Optional<ProductRouteEntity> findByProductIdAndVersion(Long productId, Integer version);
}
