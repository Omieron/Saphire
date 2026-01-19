package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.production.ProductInstanceEntity;
import com.crownbyte.Saphire.entity.production.enums.InstanceStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductInstanceRepository extends JpaRepository<ProductInstanceEntity, Long> {
    Optional<ProductInstanceEntity> findBySerialNumber(String serialNumber);

    List<ProductInstanceEntity> findByLocationId(Long locationId);

    List<ProductInstanceEntity> findByLocationIdAndStatus(Long locationId, InstanceStatusEnum status);

    List<ProductInstanceEntity> findByLocationIdAndStatusInOrderByPriorityDescDueDateAsc(Long locationId,
            List<InstanceStatusEnum> statuses);

    List<ProductInstanceEntity> findByStatusIn(List<InstanceStatusEnum> statuses);
}
