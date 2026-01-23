package com.crownbyte.Saphire.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DashboardDataResponse {
    private DashboardSummaryResponse summary;
    private QcMetricsResponse qcMetrics;
    private MachineStatusMetricsResponse machineMetrics;
    private List<ProductPerformance> productPerformance;
    private List<CriticalAlert> alerts;
    private List<RecentActivity> activities;

    @Data
    @Builder
    public static class ProductPerformance {
        private String productName;
        private long totalQc;
        private double passRate;
    }

    @Data
    @Builder
    public static class CriticalAlert {
        private String id;
        private String type; // ERROR, WARNING, INFO
        private String title;
        private String message;
        private LocalDateTime timestamp;
    }

    @Data
    @Builder
    public static class RecentActivity {
        private String id;
        private String type; // QC_RECORD, TASK, SYSTEM
        private String description;
        private String userName;
        private LocalDateTime timestamp;
        private String status; // SUCCESS, FAILURE, PENDING
    }
}
