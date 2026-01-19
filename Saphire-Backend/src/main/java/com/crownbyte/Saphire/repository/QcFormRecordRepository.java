package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import com.crownbyte.Saphire.entity.qc.enums.RecordStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QcFormRecordRepository extends JpaRepository<QcFormRecordEntity, Long> {
    List<QcFormRecordEntity> findByTemplateId(Long templateId);

    List<QcFormRecordEntity> findByMachineId(Long machineId);

    List<QcFormRecordEntity> findByFilledById(Long userId);

    List<QcFormRecordEntity> findByStatus(RecordStatusEnum status);

    List<QcFormRecordEntity> findByMachineIdAndStatus(Long machineId, RecordStatusEnum status);

    List<QcFormRecordEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<QcFormRecordEntity> findByMachineIdAndCreatedAtBetween(Long machineId, LocalDateTime start, LocalDateTime end);
}
