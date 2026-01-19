package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.ProductRequest;
import com.crownbyte.Saphire.dto.response.ProductResponse;
import com.crownbyte.Saphire.entity.master.ProductEntity;
import com.crownbyte.Saphire.repository.ProductRepository;
import com.crownbyte.Saphire.service.impl.ProductServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService implements ProductServiceImpl {

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getActive() {
        return productRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductResponse> getById(Long id) {
        return productRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductResponse> getByCode(String code) {
        return productRepository.findByCode(code)
                .map(this::toResponse);
    }

    @Override
    public ProductResponse create(ProductRequest request) {
        ProductEntity entity = ProductEntity.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        ProductEntity saved = productRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public ProductResponse update(Long id, ProductRequest request) {
        ProductEntity entity = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setDescription(request.getDescription());
        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }

        ProductEntity saved = productRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new EntityNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCode(String code) {
        return productRepository.existsByCode(code);
    }

    private ProductResponse toResponse(ProductEntity entity) {
        return ProductResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
