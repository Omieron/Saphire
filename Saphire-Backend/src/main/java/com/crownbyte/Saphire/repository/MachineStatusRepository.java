package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.master.MachineStatusEntity;
import com.crownbyte.Saphire.entity.master.enums.MachineStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MachineStatusRepository extends JpaRepository<MachineStatusEntity, Long> {
    Optional<MachineStatusEntity> findByMachineId(Long machineId);

    List<MachineStatusEntity> findByCurrentStatus(MachineStatusEnum status);

    List<MachineStatusEntity> findByMachineLocationId(Long locationId);
}
