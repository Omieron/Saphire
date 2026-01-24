package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import com.crownbyte.Saphire.entity.qc.enums.OverallResultEnum;
import com.crownbyte.Saphire.entity.qc.enums.RecordStatusEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface QcFormRecordRepository
        extends JpaRepository<QcFormRecordEntity, Long>, JpaSpecificationExecutor<QcFormRecordEntity> {
    List<QcFormRecordEntity> findByTemplateId(Long templateId);

    List<QcFormRecordEntity> findByMachineId(Long machineId);

    List<QcFormRecordEntity> findByFilledById(Long userId);

    List<QcFormRecordEntity> findByStatus(RecordStatusEnum status);

    List<QcFormRecordEntity> findByMachineIdAndStatus(Long machineId, RecordStatusEnum status);

    List<QcFormRecordEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<QcFormRecordEntity> findByMachineIdAndCreatedAtBetween(Long machineId, LocalDateTime start, LocalDateTime end);

    long countByOverallResult(OverallResultEnum result);

    long countByOverallResultAndCreatedAtBetween(OverallResultEnum result, LocalDateTime start, LocalDateTime end);

    List<QcFormRecordEntity> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT p.name, COUNT(q), SUM(CASE WHEN q.overallResult = com.crownbyte.Saphire.entity.qc.enums.OverallResultEnum.PASS THEN 1 ELSE 0 END) "
            +
            "FROM QcFormRecordEntity q JOIN q.productInstance pi JOIN pi.product p " +
            "GROUP BY p.name")
    List<Object[]> getProductPerformanceStats();
}
