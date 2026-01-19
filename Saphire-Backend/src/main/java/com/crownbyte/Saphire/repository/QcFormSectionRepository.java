package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.qc.QcFormSectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QcFormSectionRepository extends JpaRepository<QcFormSectionEntity, Long> {
    List<QcFormSectionEntity> findByTemplateIdOrderBySectionOrderAsc(Long templateId);
}
