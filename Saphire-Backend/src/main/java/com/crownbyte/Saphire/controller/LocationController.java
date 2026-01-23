package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.request.LocationRequest;
import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.dto.response.LocationResponse;
import com.crownbyte.Saphire.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getAll(@RequestParam(required = false) String search) {
        List<LocationResponse> locations = locationService.getAll(search);
        return ResponseEntity.ok(ApiResponse.success(locations));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getByCompanyId(@PathVariable Long companyId) {
        List<LocationResponse> locations = locationService.getByCompanyId(companyId);
        return ResponseEntity.ok(ApiResponse.success(locations));
    }

    @GetMapping("/company/{companyId}/active")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> getActiveByCompanyId(@PathVariable Long companyId) {
        List<LocationResponse> locations = locationService.getActiveByCompanyId(companyId);
        return ResponseEntity.ok(ApiResponse.success(locations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LocationResponse>> getById(@PathVariable Long id) {
        return locationService.getById(id)
                .map(location -> ResponseEntity.ok(ApiResponse.success(location)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Location not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LocationResponse>> create(@Valid @RequestBody LocationRequest request) {
        try {
            LocationResponse location = locationService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Location created successfully", location));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LocationResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody LocationRequest request) {
        try {
            LocationResponse location = locationService.update(id, request);
            return ResponseEntity.ok(ApiResponse.success("Location updated successfully", location));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            locationService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Location deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
