package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.request.QcFormRecordRequest;
import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.dto.response.QcFormRecordResponse;
import com.crownbyte.Saphire.service.QcFormRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/qc-records")
@RequiredArgsConstructor
public class QcFormRecordController {

    private final QcFormRecordService recordService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QcFormRecordResponse>>> getAll() {
        List<QcFormRecordResponse> records = recordService.getAll();
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/template/{templateId}")
    public ResponseEntity<ApiResponse<List<QcFormRecordResponse>>> getByTemplateId(@PathVariable Long templateId) {
        List<QcFormRecordResponse> records = recordService.getByTemplateId(templateId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/machine/{machineId}")
    public ResponseEntity<ApiResponse<List<QcFormRecordResponse>>> getByMachineId(@PathVariable Long machineId) {
        List<QcFormRecordResponse> records = recordService.getByMachineId(machineId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/filled-by/{userId}")
    public ResponseEntity<ApiResponse<List<QcFormRecordResponse>>> getByFilledById(@PathVariable Long userId) {
        List<QcFormRecordResponse> records = recordService.getByFilledById(userId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<QcFormRecordResponse>>> getByStatus(@PathVariable String status) {
        try {
            List<QcFormRecordResponse> records = recordService.getByStatus(status);
            return ResponseEntity.ok(ApiResponse.success(records));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status: " + status));
        }
    }

    @GetMapping("/machine/{machineId}/status/{status}")
    public ResponseEntity<ApiResponse<List<QcFormRecordResponse>>> getByMachineIdAndStatus(
            @PathVariable Long machineId,
            @PathVariable String status) {
        try {
            List<QcFormRecordResponse> records = recordService.getByMachineIdAndStatus(machineId, status);
            return ResponseEntity.ok(ApiResponse.success(records));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid status: " + status));
        }
    }

    @GetMapping("/date-range")
    public ResponseEntity<ApiResponse<List<QcFormRecordResponse>>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<QcFormRecordResponse> records = recordService.getByDateRange(start, end);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<QcFormRecordResponse>>> getMyRecords(
            @RequestHeader("X-User-Id") Long userId) {
        List<QcFormRecordResponse> records = recordService.getByFilledById(userId);
        return ResponseEntity.ok(ApiResponse.success(records));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QcFormRecordResponse>> getById(@PathVariable Long id) {
        return recordService.getById(id)
                .map(record -> ResponseEntity.ok(ApiResponse.success(record)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("QC Record not found with id: " + id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<QcFormRecordResponse>> create(
            @Valid @RequestBody QcFormRecordRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            QcFormRecordResponse record = recordService.create(request, userId);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("QC Record created successfully", record));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<QcFormRecordResponse>> submit(@PathVariable Long id) {
        try {
            QcFormRecordResponse record = recordService.submit(id);
            return ResponseEntity.ok(ApiResponse.success("QC Record submitted successfully", record));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<QcFormRecordResponse>> approve(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        try {
            QcFormRecordResponse record = recordService.approve(id, userId);
            return ResponseEntity.ok(ApiResponse.success("QC Record approved successfully", record));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<QcFormRecordResponse>> reject(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam String reason) {
        try {
            QcFormRecordResponse record = recordService.reject(id, userId, reason);
            return ResponseEntity.ok(ApiResponse.success("QC Record rejected", record));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}/notes")
    public ResponseEntity<ApiResponse<QcFormRecordResponse>> updateNotes(
            @PathVariable Long id,
            @RequestBody String notes) {
        try {
            QcFormRecordResponse record = recordService.updateNotes(id, notes);
            return ResponseEntity.ok(ApiResponse.success("Notes updated successfully", record));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
 
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        try {
            recordService.delete(id);
            return ResponseEntity.ok(ApiResponse.success("QC Record deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
