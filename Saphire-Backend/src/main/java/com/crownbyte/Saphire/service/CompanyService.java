package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.CompanyRequest;
import com.crownbyte.Saphire.dto.response.CompanyResponse;
import com.crownbyte.Saphire.entity.master.CompanyEntity;
import com.crownbyte.Saphire.repository.CompanyRepository;
import com.crownbyte.Saphire.service.impl.CompanyServiceImpl;
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
public class CompanyService implements CompanyServiceImpl {

    private final CompanyRepository companyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getAll(String search) {
        List<CompanyEntity> companies;
        if (search != null && !search.trim().isEmpty()) {
            companies = companyRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(search, search);
        } else {
            companies = companyRepository.findAll();
        }
        return companies.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyResponse> getById(Long id) {
        return companyRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CompanyResponse> getByCode(String code) {
        return companyRepository.findByCode(code)
                .map(this::toResponse);
    }

    @Override
    public CompanyResponse create(CompanyRequest request) {
        CompanyEntity entity = CompanyEntity.builder()
                .name(request.getName())
                .code(request.getCode())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        CompanyEntity saved = companyRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public CompanyResponse update(Long id, CompanyRequest request) {
        CompanyEntity entity = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with id: " + id));

        entity.setName(request.getName());
        entity.setCode(request.getCode());
        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }

        CompanyEntity saved = companyRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        CompanyEntity entity = companyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Company not found with id: " + id));
        entity.setActive(false);
        companyRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCode(String code) {
        return companyRepository.existsByCode(code);
    }

    private CompanyResponse toResponse(CompanyEntity entity) {
        return CompanyResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
