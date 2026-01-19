package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.production.ProductionStepEntity;
import com.crownbyte.Saphire.entity.production.enums.ProductionStepStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductionStepRepository extends JpaRepository<ProductionStepEntity, Long> {
        List<ProductionStepEntity> findByProductInstanceId(Long productInstanceId);

        List<ProductionStepEntity> findByMachineIdAndStatus(Long machineId, ProductionStepStatusEnum status);

        @Query("SELECT ps FROM ProductionStepEntity ps " +
                        "JOIN ps.productInstance pi " +
                        "WHERE pi.location.id = :locationId AND ps.status = :status " +
                        "ORDER BY pi.priority DESC, pi.dueDate ASC")
        List<ProductionStepEntity> findPendingByLocationOrderByPriority(
                        @Param("locationId") Long locationId,
                        @Param("status") ProductionStepStatusEnum status);

        @Query("SELECT ps FROM ProductionStepEntity ps " +
                        "JOIN ps.productInstance pi " +
                        "WHERE pi.location.id = :locationId AND ps.machine.id = :machineId AND ps.status = :status " +
                        "ORDER BY pi.priority DESC, pi.dueDate ASC")
        List<ProductionStepEntity> findPendingByLocationAndMachineOrderByPriority(
                        @Param("locationId") Long locationId,
                        @Param("machineId") Long machineId,
                        @Param("status") ProductionStepStatusEnum status);

        Optional<ProductionStepEntity> findFirstByProductInstanceLocationIdAndStatusOrderByProductInstancePriorityDescProductInstanceDueDateAsc(
                        Long locationId, ProductionStepStatusEnum status);
}
