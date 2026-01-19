package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.qc.QcFormHeaderFieldEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QcFormHeaderFieldRepository extends JpaRepository<QcFormHeaderFieldEntity, Long> {
    List<QcFormHeaderFieldEntity> findByTemplateIdOrderByFieldOrderAsc(Long templateId);
}
