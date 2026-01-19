package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.master.MachineEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MachineRepository extends JpaRepository<MachineEntity, Long> {
    List<MachineEntity> findByLocationId(Long locationId);

    List<MachineEntity> findByLocationIdAndActiveTrue(Long locationId);

    List<MachineEntity> findByLocationIdAndActiveTrueAndMaintenanceModeFalse(Long locationId);

    Optional<MachineEntity> findByLocationIdAndCode(Long locationId, String code);

    boolean existsByLocationIdAndCode(Long locationId, String code);
}
