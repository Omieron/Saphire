package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.CompanyRequest;
import com.crownbyte.Saphire.dto.response.CompanyResponse;
import java.util.List;
import java.util.Optional;

public interface CompanyService {

    List<CompanyResponse> getAll(String search);

    Optional<CompanyResponse> getById(Long id);

    Optional<CompanyResponse> getByCode(String code);

    CompanyResponse create(CompanyRequest request);

    CompanyResponse update(Long id, CompanyRequest request);

    void delete(Long id);

    boolean existsByCode(String code);
}
