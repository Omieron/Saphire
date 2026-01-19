package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.QcFormTemplateRequest;
import com.crownbyte.Saphire.dto.response.QcFormTemplateResponse;
import java.util.List;
import java.util.Optional;

public interface QcFormTemplateServiceImpl {

    List<QcFormTemplateResponse> getAll();

    List<QcFormTemplateResponse> getActive();

    List<QcFormTemplateResponse> getByCompanyId(Long companyId);

    List<QcFormTemplateResponse> getByMachineId(Long machineId);

    List<QcFormTemplateResponse> getByProductId(Long productId);

    List<QcFormTemplateResponse> getByContextType(String contextType);

    Optional<QcFormTemplateResponse> getById(Long id);

    Optional<QcFormTemplateResponse> getByCode(String code);

    QcFormTemplateResponse create(QcFormTemplateRequest request);

    QcFormTemplateResponse update(Long id, QcFormTemplateRequest request);

    void delete(Long id);

    boolean existsByCode(String code);
}
