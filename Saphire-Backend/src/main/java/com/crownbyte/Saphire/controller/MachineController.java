package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.request.MachineRequest;
import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.dto.response.MachineResponse;
import com.crownbyte.Saphire.service.MachineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MachineResponse>>> getAll(@RequestParam(required = false) String search) {
        List<MachineResponse> machines = machineService.getAll(search);
        return ResponseEntity.ok(ApiResponse.success(machines));
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<ApiResponse<List<MachineResponse>>> getByLocationId(@PathVariable Long locationId) {
        List<MachineResponse> machines = machineService.getByLocationId(locationId);
        return ResponseEntity.ok(ApiResponse.success(machines));
    }

    @GetMapping("/location/{locationId}/active")
    public ResponseEntity<ApiResponse<List<MachineResponse>>> getActiveByLocationId(@PathVariable Long locationId) {
        List<MachineResponse> machines = machineService.getActiveByLocationId(locationId);
        return ResponseEntity.ok(ApiResponse.success(machines));
    }

    @GetMapping("/location/{locationId}/available")
    public ResponseEntity<ApiResponse<List<MachineResponse>>> getAvailableByLocationId(@PathVariable Long locationId) {
        List<MachineResponse> machines = machineService.getAvailableByLocationId(locationId);
        return ResponseEntity.ok(ApiResponse.success(machines));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MachineResponse>> getById(@PathVariable Long id) {
        return machineService.getById(id)
                .map(machine -> ResponseEntity.ok(ApiResponse.success(machine)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Machine not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MachineResponse>> create(@Valid @RequestBody MachineRequest request) {
        try {
            MachineResponse machine = machineService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Machine created successfully", machine));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MachineResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody MachineRequest request) {
        try {
            MachineResponse machine = machineService.update(id, request);
            return ResponseEntity.ok(ApiResponse.success("Machine updated successfully", machine));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/maintenance")
    public ResponseEntity<ApiResponse<MachineResponse>> setMaintenanceMode(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        try {
            MachineResponse machine = machineService.setMaintenanceMode(id, enabled);
            String message = enabled ? "Machine is now in maintenance mode" : "Machine is now available";
            return ResponseEntity.ok(ApiResponse.success(message, machine));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            machineService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Machine deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
