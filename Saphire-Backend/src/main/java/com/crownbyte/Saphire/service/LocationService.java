package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.LocationRequest;
import com.crownbyte.Saphire.dto.response.LocationResponse;
import com.crownbyte.Saphire.entity.master.CompanyEntity;
import com.crownbyte.Saphire.entity.master.LocationEntity;
import com.crownbyte.Saphire.repository.CompanyRepository;
import com.crownbyte.Saphire.repository.LocationRepository;
import com.crownbyte.Saphire.service.impl.LocationServiceImpl;
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
public class LocationService implements LocationServiceImpl {

    private final LocationRepository locationRepository;
    private final CompanyRepository companyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getAll(String search) {
        List<LocationEntity> locations;
        if (search != null && !search.trim().isEmpty()) {
            locations = locationRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(search, search);
        } else {
            locations = locationRepository.findAll();
        }
        return locations.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getByCompanyId(Long companyId) {
        return locationRepository.findByCompanyId(companyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LocationResponse> getActiveByCompanyId(Long companyId) {
        return locationRepository.findByCompanyIdAndActiveTrue(companyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<LocationResponse> getById(Long id) {
        return locationRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    public LocationResponse create(LocationRequest request) {
        CompanyEntity company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new EntityNotFoundException("Company not found with id: " + request.getCompanyId()));

        LocationEntity entity = LocationEntity.builder()
                .company(company)
                .name(request.getName())
                .code(request.getCode())
                .address(request.getAddress())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        LocationEntity saved = locationRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public LocationResponse update(Long id, LocationRequest request) {
        LocationEntity entity = locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + id));

        if (request.getCompanyId() != null && !request.getCompanyId().equals(entity.getCompany().getId())) {
            CompanyEntity company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Company not found with id: " + request.getCompanyId()));
            entity.setCompany(company);
        }

        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setAddress(request.getAddress());
        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }

        LocationEntity saved = locationRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        LocationEntity entity = locationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + id));
        entity.setActive(false);
        locationRepository.save(entity);
    }

    private LocationResponse toResponse(LocationEntity entity) {
        return LocationResponse.builder()
                .id(entity.getId())
                .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
                .companyName(entity.getCompany() != null ? entity.getCompany().getName() : null)
                .name(entity.getName())
                .code(entity.getCode())
                .address(entity.getAddress())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
