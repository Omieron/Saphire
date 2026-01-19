package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.qc.QcFormValueEntity;
import com.crownbyte.Saphire.entity.qc.enums.ValueResultEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QcFormValueRepository extends JpaRepository<QcFormValueEntity, Long> {
    List<QcFormValueEntity> findByRecordId(Long recordId);

    List<QcFormValueEntity> findByRecordIdAndResult(Long recordId, ValueResultEnum result);

    List<QcFormValueEntity> findByFieldId(Long fieldId);
}
