package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.qc.QcFormTemplateEntity;
import com.crownbyte.Saphire.entity.qc.enums.ContextTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QcFormTemplateRepository extends JpaRepository<QcFormTemplateEntity, Long> {
    Optional<QcFormTemplateEntity> findByCode(String code);

    boolean existsByCode(String code);

    List<QcFormTemplateEntity> findByActiveTrue();

    List<QcFormTemplateEntity> findByCompanyId(Long companyId);

    List<QcFormTemplateEntity> findByMachineId(Long machineId);

    List<QcFormTemplateEntity> findByProductId(Long productId);

    List<QcFormTemplateEntity> findByContextTypeAndActiveTrue(ContextTypeEnum contextType);
}
