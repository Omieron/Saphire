package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.QcFormRecordRequest;
import com.crownbyte.Saphire.dto.response.QcFormRecordResponse;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface QcFormRecordServiceImpl {

    List<QcFormRecordResponse> getAll();

    List<QcFormRecordResponse> getByTemplateId(Long templateId);

    List<QcFormRecordResponse> getByMachineId(Long machineId);

    List<QcFormRecordResponse> getByFilledById(Long userId);

    List<QcFormRecordResponse> getByStatus(String status);

    List<QcFormRecordResponse> getByMachineIdAndStatus(Long machineId, String status);

    List<QcFormRecordResponse> getByDateRange(LocalDateTime start, LocalDateTime end);

    Optional<QcFormRecordResponse> getById(Long id);

    QcFormRecordResponse create(QcFormRecordRequest request, Long filledById);

    QcFormRecordResponse submit(Long id);

    QcFormRecordResponse approve(Long id, Long approvedById);

    QcFormRecordResponse reject(Long id, Long rejectedById, String reason);

    void delete(Long id);
}
