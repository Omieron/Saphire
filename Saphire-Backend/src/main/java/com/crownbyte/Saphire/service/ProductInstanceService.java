package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.ProductInstanceRequest;
import com.crownbyte.Saphire.dto.response.ProductInstanceResponse;
import java.util.List;
import java.util.Optional;

public interface ProductInstanceService {

    List<ProductInstanceResponse> getAll();

    List<ProductInstanceResponse> getByLocationId(Long locationId);

    List<ProductInstanceResponse> getByLocationIdAndStatus(Long locationId, String status);

    List<ProductInstanceResponse> getPendingByLocationId(Long locationId);

    Optional<ProductInstanceResponse> getById(Long id);

    Optional<ProductInstanceResponse> getBySerialNumber(String serialNumber);

    ProductInstanceResponse create(ProductInstanceRequest request);

    ProductInstanceResponse updateStatus(Long id, String status);

    void delete(Long id);
}
