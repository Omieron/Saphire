package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.dto.response.dashboard.DashboardDataResponse;
import com.crownbyte.Saphire.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/data")
    public ResponseEntity<ApiResponse<DashboardDataResponse>> getDashboardData() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardData()));
    }
}
