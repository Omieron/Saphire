package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.ProductRequest;
import com.crownbyte.Saphire.dto.response.ProductResponse;
import java.util.List;
import java.util.Optional;

public interface ProductService {

    List<ProductResponse> getAll(String search);

    List<ProductResponse> getActive();

    Optional<ProductResponse> getById(Long id);

    Optional<ProductResponse> getByCode(String code);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);

    boolean existsByCode(String code);
}
