package com.crownbyte.Saphire.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class QcMetricsResponse {
    private long totalRecords;
    private long passedCount;
    private long failedCount;
    private double passRate;
    private List<DailyMetric> weeklyTrend;

    @Data
    @Builder
    public static class DailyMetric {
        private String date;
        private long passed;
        private long failed;
    }
}
