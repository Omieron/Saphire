package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.request.ProductInstanceRequest;
import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.dto.response.ProductInstanceResponse;
import com.crownbyte.Saphire.service.ProductInstanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/product-instances")
@RequiredArgsConstructor
public class ProductInstanceController {

    private final ProductInstanceService productInstanceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductInstanceResponse>>> getAll() {
        List<ProductInstanceResponse> instances = productInstanceService.getAll();
        return ResponseEntity.ok(ApiResponse.success(instances));
    }

    @GetMapping("/location/{locationId}")
    public ResponseEntity<ApiResponse<List<ProductInstanceResponse>>> getByLocationId(@PathVariable Long locationId) {
        List<ProductInstanceResponse> instances = productInstanceService.getByLocationId(locationId);
        return ResponseEntity.ok(ApiResponse.success(instances));
    }

    @GetMapping("/location/{locationId}/status/{status}")
    public ResponseEntity<ApiResponse<List<ProductInstanceResponse>>> getByLocationIdAndStatus(
            @PathVariable Long locationId,
            @PathVariable String status) {
        try {
            List<ProductInstanceResponse> instances = productInstanceService.getByLocationIdAndStatus(locationId,
                    status);
            return ResponseEntity.ok(ApiResponse.success(instances));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status: " + status));
        }
    }

    @GetMapping("/location/{locationId}/pending")
    public ResponseEntity<ApiResponse<List<ProductInstanceResponse>>> getPendingByLocationId(
            @PathVariable Long locationId) {
        List<ProductInstanceResponse> instances = productInstanceService.getPendingByLocationId(locationId);
        return ResponseEntity.ok(ApiResponse.success(instances));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductInstanceResponse>> getById(@PathVariable Long id) {
        return productInstanceService.getById(id)
                .map(instance -> ResponseEntity.ok(ApiResponse.success(instance)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product instance not found with id: " + id)));
    }

    @GetMapping("/serial/{serialNumber}")
    public ResponseEntity<ApiResponse<ProductInstanceResponse>> getBySerialNumber(@PathVariable String serialNumber) {
        return productInstanceService.getBySerialNumber(serialNumber)
                .map(instance -> ResponseEntity.ok(ApiResponse.success(instance)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Product instance not found with serial number: " + serialNumber)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductInstanceResponse>> create(
            @Valid @RequestBody ProductInstanceRequest request) {
        try {
            ProductInstanceResponse instance = productInstanceService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Product instance created successfully", instance));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ProductInstanceResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            ProductInstanceResponse instance = productInstanceService.updateStatus(id, status);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", instance));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status: " + status));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            productInstanceService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Product instance deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
