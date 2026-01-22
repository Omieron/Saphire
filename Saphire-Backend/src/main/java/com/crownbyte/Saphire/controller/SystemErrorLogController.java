package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.entity.SystemErrorLog;
import com.crownbyte.Saphire.service.SystemErrorLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SystemErrorLogController {

    private final SystemErrorLogService errorLogService;

    @GetMapping
    public ApiResponse<List<SystemErrorLog>> getLogs() {
        return ApiResponse.success("Logs retrieved successfully", errorLogService.getAllLogs());
    }
}
