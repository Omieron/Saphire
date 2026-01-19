package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.route.RouteStepMachineEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RouteStepMachineRepository extends JpaRepository<RouteStepMachineEntity, Long> {
    List<RouteStepMachineEntity> findByRouteStepIdOrderByPreferenceOrderAsc(Long routeStepId);

    Optional<RouteStepMachineEntity> findByRouteStepIdAndMachineId(Long routeStepId, Long machineId);

    List<RouteStepMachineEntity> findByMachineId(Long machineId);
}
