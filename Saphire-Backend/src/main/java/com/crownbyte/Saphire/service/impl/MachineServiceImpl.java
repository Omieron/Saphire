package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.MachineRequest;
import com.crownbyte.Saphire.dto.response.MachineResponse;
import java.util.List;
import java.util.Optional;

public interface MachineServiceImpl {

    List<MachineResponse> getAll(String search);

    List<MachineResponse> getByLocationId(Long locationId);

    List<MachineResponse> getActiveByLocationId(Long locationId);

    List<MachineResponse> getAvailableByLocationId(Long locationId);

    Optional<MachineResponse> getById(Long id);

    MachineResponse create(MachineRequest request);

    MachineResponse update(Long id, MachineRequest request);

    MachineResponse setMaintenanceMode(Long id, boolean maintenanceMode);

    void delete(Long id);
}
