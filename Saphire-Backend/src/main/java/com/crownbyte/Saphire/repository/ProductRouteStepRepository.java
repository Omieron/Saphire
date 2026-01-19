package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.route.ProductRouteStepEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRouteStepRepository extends JpaRepository<ProductRouteStepEntity, Long> {
    List<ProductRouteStepEntity> findByRouteIdOrderByStepOrderAsc(Long routeId);
}
