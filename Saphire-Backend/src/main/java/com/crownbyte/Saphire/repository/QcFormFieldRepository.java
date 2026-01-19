package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.qc.QcFormFieldEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QcFormFieldRepository extends JpaRepository<QcFormFieldEntity, Long> {
    List<QcFormFieldEntity> findBySectionIdOrderByFieldOrderAsc(Long sectionId);
}
