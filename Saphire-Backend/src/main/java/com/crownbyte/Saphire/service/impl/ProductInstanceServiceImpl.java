package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.ProductInstanceRequest;
import com.crownbyte.Saphire.dto.response.ProductInstanceResponse;
import com.crownbyte.Saphire.dto.response.ProductionStepResponse;
import com.crownbyte.Saphire.entity.master.LocationEntity;
import com.crownbyte.Saphire.entity.master.ProductEntity;
import com.crownbyte.Saphire.entity.production.ProductInstanceEntity;
import com.crownbyte.Saphire.entity.production.ProductionStepEntity;
import com.crownbyte.Saphire.entity.production.enums.InstanceStatusEnum;
import com.crownbyte.Saphire.entity.route.ProductRouteEntity;
import com.crownbyte.Saphire.repository.*;
import com.crownbyte.Saphire.service.ProductInstanceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductInstanceServiceImpl implements ProductInstanceService {

    private final ProductInstanceRepository productInstanceRepository;
    private final ProductRepository productRepository;
    private final ProductRouteRepository productRouteRepository;
    private final LocationRepository locationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductInstanceResponse> getAll() {
        return productInstanceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductInstanceResponse> getByLocationId(Long locationId) {
        return productInstanceRepository.findByLocationId(locationId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductInstanceResponse> getByLocationIdAndStatus(Long locationId, String status) {
        InstanceStatusEnum statusEnum = InstanceStatusEnum.valueOf(status.toUpperCase());
        return productInstanceRepository.findByLocationIdAndStatus(locationId, statusEnum)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductInstanceResponse> getPendingByLocationId(Long locationId) {
        List<InstanceStatusEnum> statuses = List.of(InstanceStatusEnum.PENDING, InstanceStatusEnum.IN_PROGRESS);
        return productInstanceRepository.findByLocationIdAndStatusInOrderByPriorityDescDueDateAsc(locationId, statuses)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductInstanceResponse> getById(Long id) {
        return productInstanceRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductInstanceResponse> getBySerialNumber(String serialNumber) {
        return productInstanceRepository.findBySerialNumber(serialNumber)
                .map(this::toResponse);
    }

    @Override
    public ProductInstanceResponse create(ProductInstanceRequest request) {
        ProductEntity product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));

        ProductRouteEntity route = productRouteRepository.findById(request.getRouteId())
                .orElseThrow(() -> new EntityNotFoundException("Route not found with id: " + request.getRouteId()));

        LocationEntity location = locationRepository.findById(request.getLocationId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));

        String serialNumber = request.getSerialNumber();
        if (serialNumber == null || serialNumber.isEmpty()) {
            serialNumber = UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        }

        ProductInstanceEntity entity = ProductInstanceEntity.builder()
                .product(product)
                .route(route)
                .location(location)
                .serialNumber(serialNumber)
                .status(InstanceStatusEnum.PENDING)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .dueDate(request.getDueDate())
                .notes(request.getNotes())
                .build();

        ProductInstanceEntity saved = productInstanceRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public ProductInstanceResponse updateStatus(Long id, String status) {
        ProductInstanceEntity entity = productInstanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product instance not found with id: " + id));

        InstanceStatusEnum statusEnum = InstanceStatusEnum.valueOf(status.toUpperCase());
        entity.setStatus(statusEnum);

        ProductInstanceEntity saved = productInstanceRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        if (!productInstanceRepository.existsById(id)) {
            throw new EntityNotFoundException("Product instance not found with id: " + id);
        }
        productInstanceRepository.deleteById(id);
    }

    private ProductInstanceResponse toResponse(ProductInstanceEntity entity) {
        List<ProductionStepResponse> stepsResponse = null;
        if (entity.getProductionSteps() != null) {
            stepsResponse = entity.getProductionSteps()
                    .stream()
                    .map(this::toStepResponse)
                    .collect(Collectors.toList());
        }

        return ProductInstanceResponse.builder()
                .id(entity.getId())
                .productId(entity.getProduct().getId())
                .productName(entity.getProduct().getName())
                .productCode(entity.getProduct().getCode())
                .routeId(entity.getRoute().getId())
                .routeName(entity.getRoute().getName())
                .locationId(entity.getLocation().getId())
                .locationName(entity.getLocation().getName())
                .serialNumber(entity.getSerialNumber())
                .status(entity.getStatus().name())
                .priority(entity.getPriority())
                .dueDate(entity.getDueDate())
                .startedAt(entity.getStartedAt())
                .completedAt(entity.getCompletedAt())
                .createdById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null)
                .createdByName(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName() : null)
                .notes(entity.getNotes())
                .productionSteps(stepsResponse)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private ProductionStepResponse toStepResponse(ProductionStepEntity step) {
        return ProductionStepResponse.builder()
                .id(step.getId())
                .productInstanceId(step.getProductInstance().getId())
                .routeStepId(step.getRouteStep().getId())
                .stepName(step.getRouteStep().getStepName())
                .stepOrder(step.getRouteStep().getStepOrder())
                .machineId(step.getMachine() != null ? step.getMachine().getId() : null)
                .machineName(step.getMachine() != null ? step.getMachine().getName() : null)
                .machineCode(step.getMachine() != null ? step.getMachine().getCode() : null)
                .operatorId(step.getOperator() != null ? step.getOperator().getId() : null)
                .operatorName(step.getOperator() != null ? step.getOperator().getFullName() : null)
                .status(step.getStatus().name())
                .startedAt(step.getStartedAt())
                .finishedAt(step.getFinishedAt())
                .retryCount(step.getRetryCount())
                .failureReason(step.getFailureReason())
                .correctiveAction(step.getCorrectiveAction())
                .notes(step.getNotes())
                .build();
    }
}
