package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.request.CompanyRequest;
import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.dto.response.CompanyResponse;
import com.crownbyte.Saphire.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getAll(@RequestParam(required = false) String search) {
        List<CompanyResponse> companies = companyService.getAll(search);
        return ResponseEntity.ok(ApiResponse.success(companies));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getById(@PathVariable Long id) {
        return companyService.getById(id)
                .map(company -> ResponseEntity.ok(ApiResponse.success(company)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Company not found with id: " + id)));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getByCode(@PathVariable String code) {
        return companyService.getByCode(code)
                .map(company -> ResponseEntity.ok(ApiResponse.success(company)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Company not found with code: " + code)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompanyResponse>> create(@Valid @RequestBody CompanyRequest request) {
        if (companyService.existsByCode(request.getCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Company with code already exists: " + request.getCode()));
        }
        CompanyResponse company = companyService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Company created successfully", company));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody CompanyRequest request) {
        try {
            CompanyResponse company = companyService.update(id, request);
            return ResponseEntity.ok(ApiResponse.success("Company updated successfully", company));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            companyService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("Company deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
