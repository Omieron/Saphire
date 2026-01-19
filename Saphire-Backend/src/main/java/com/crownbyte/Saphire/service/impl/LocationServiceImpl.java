package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.LocationRequest;
import com.crownbyte.Saphire.dto.response.LocationResponse;
import java.util.List;
import java.util.Optional;

public interface LocationServiceImpl {

    List<LocationResponse> getAll();

    List<LocationResponse> getByCompanyId(Long companyId);

    List<LocationResponse> getActiveByCompanyId(Long companyId);

    Optional<LocationResponse> getById(Long id);

    LocationResponse create(LocationRequest request);

    LocationResponse update(Long id, LocationRequest request);

    void delete(Long id);
}
