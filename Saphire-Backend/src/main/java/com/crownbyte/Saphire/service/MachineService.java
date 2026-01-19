package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.MachineRequest;
import com.crownbyte.Saphire.dto.response.MachineResponse;
import com.crownbyte.Saphire.dto.response.MachineStatusResponse;
import com.crownbyte.Saphire.entity.master.LocationEntity;
import com.crownbyte.Saphire.entity.master.MachineEntity;
import com.crownbyte.Saphire.entity.master.MachineStatusEntity;
import com.crownbyte.Saphire.repository.LocationRepository;
import com.crownbyte.Saphire.repository.MachineRepository;
import com.crownbyte.Saphire.repository.MachineStatusRepository;
import com.crownbyte.Saphire.service.impl.MachineServiceImpl;
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
public class MachineService implements MachineServiceImpl {

    private final MachineRepository machineRepository;
    private final LocationRepository locationRepository;
    private final MachineStatusRepository machineStatusRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MachineResponse> getAll() {
        return machineRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MachineResponse> getByLocationId(Long locationId) {
        return machineRepository.findByLocationId(locationId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MachineResponse> getActiveByLocationId(Long locationId) {
        return machineRepository.findByLocationIdAndActiveTrue(locationId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MachineResponse> getAvailableByLocationId(Long locationId) {
        return machineRepository.findByLocationIdAndActiveTrueAndMaintenanceModeFalse(locationId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MachineResponse> getById(Long id) {
        return machineRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    public MachineResponse create(MachineRequest request) {
        LocationEntity location = locationRepository.findById(request.getLocationId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Location not found with id: " + request.getLocationId()));

        MachineEntity entity = MachineEntity.builder()
                .location(location)
                .code(request.getCode())
                .name(request.getName())
                .type(request.getType())
                .active(request.getActive() != null ? request.getActive() : true)
                .maintenanceMode(request.getMaintenanceMode() != null ? request.getMaintenanceMode() : false)
                .build();

        MachineEntity saved = machineRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public MachineResponse update(Long id, MachineRequest request) {
        MachineEntity entity = machineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Machine not found with id: " + id));

        if (request.getLocationId() != null && !request.getLocationId().equals(entity.getLocation().getId())) {
            LocationEntity location = locationRepository.findById(request.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Location not found with id: " + request.getLocationId()));
            entity.setLocation(location);
        }

        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setType(request.getType());
        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }
        if (request.getMaintenanceMode() != null) {
            entity.setMaintenanceMode(request.getMaintenanceMode());
        }

        MachineEntity saved = machineRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public MachineResponse setMaintenanceMode(Long id, boolean maintenanceMode) {
        MachineEntity entity = machineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Machine not found with id: " + id));

        entity.setMaintenanceMode(maintenanceMode);
        MachineEntity saved = machineRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        if (!machineRepository.existsById(id)) {
            throw new EntityNotFoundException("Machine not found with id: " + id);
        }
        machineRepository.deleteById(id);
    }

    private MachineResponse toResponse(MachineEntity entity) {
        MachineStatusResponse statusResponse = null;
        Optional<MachineStatusEntity> statusOpt = machineStatusRepository.findByMachineId(entity.getId());
        if (statusOpt.isPresent()) {
            MachineStatusEntity status = statusOpt.get();
            statusResponse = MachineStatusResponse.builder()
                    .id(status.getId())
                    .machineId(entity.getId())
                    .currentStatus(status.getCurrentStatus() != null ? status.getCurrentStatus().name() : null)
                    .currentInstanceId(status.getCurrentInstance() != null ? status.getCurrentInstance().getId() : null)
                    .currentStepId(status.getCurrentStep() != null ? status.getCurrentStep().getId() : null)
                    .currentOperatorId(status.getCurrentOperator() != null ? status.getCurrentOperator().getId() : null)
                    .currentOperatorName(
                            status.getCurrentOperator() != null ? status.getCurrentOperator().getFullName() : null)
                    .statusSince(status.getStatusSince())
                    .estimatedFinishAt(status.getEstimatedFinishAt())
                    .build();
        }

        return MachineResponse.builder()
                .id(entity.getId())
                .locationId(entity.getLocation().getId())
                .locationName(entity.getLocation().getName())
                .code(entity.getCode())
                .name(entity.getName())
                .type(entity.getType())
                .active(entity.getActive())
                .maintenanceMode(entity.getMaintenanceMode())
                .status(statusResponse)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
