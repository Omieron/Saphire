package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.request.QcFormTemplateRequest;
import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.dto.response.QcFormTemplateResponse;
import com.crownbyte.Saphire.service.QcFormTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/qc-templates")
@RequiredArgsConstructor
public class QcFormTemplateController {

    private final QcFormTemplateService templateService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QcFormTemplateResponse>>> getAll(@RequestParam(required = false) String search) {
        List<QcFormTemplateResponse> templates = templateService.getAll(search);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<QcFormTemplateResponse>>> getActive() {
        List<QcFormTemplateResponse> templates = templateService.getActive();
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<List<QcFormTemplateResponse>>> getByCompanyId(@PathVariable Long companyId) {
        List<QcFormTemplateResponse> templates = templateService.getByCompanyId(companyId);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @GetMapping("/machine/{machineId}")
    public ResponseEntity<ApiResponse<List<QcFormTemplateResponse>>> getByMachineId(@PathVariable Long machineId) {
        List<QcFormTemplateResponse> templates = templateService.getByMachineId(machineId);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<QcFormTemplateResponse>>> getByProductId(@PathVariable Long productId) {
        List<QcFormTemplateResponse> templates = templateService.getByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success(templates));
    }

    @GetMapping("/context/{contextType}")
    public ResponseEntity<ApiResponse<List<QcFormTemplateResponse>>> getByContextType(
            @PathVariable String contextType) {
        try {
            List<QcFormTemplateResponse> templates = templateService.getByContextType(contextType);
            return ResponseEntity.ok(ApiResponse.success(templates));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid context type: " + contextType));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QcFormTemplateResponse>> getById(@PathVariable Long id) {
        return templateService.getById(id)
                .map(template -> ResponseEntity.ok(ApiResponse.success(template)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("QC Template not found with id: " + id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<QcFormTemplateResponse>> getByCode(@PathVariable String code) {
        return templateService.getByCode(code)
                .map(template -> ResponseEntity.ok(ApiResponse.success(template)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("QC Template not found with code: " + code)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QcFormTemplateResponse>> create(
            @Valid @RequestBody QcFormTemplateRequest request) {
        if (templateService.existsByCode(request.getCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("QC Template with code already exists: " + request.getCode()));
        }
        try {
            QcFormTemplateResponse template = templateService.create(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("QC Template created successfully", template));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<QcFormTemplateResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody QcFormTemplateRequest request) {
        try {
            QcFormTemplateResponse template = templateService.update(id, request);
            return ResponseEntity.ok(ApiResponse.success("QC Template updated successfully", template));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            templateService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("QC Template deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
