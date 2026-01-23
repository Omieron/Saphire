package com.crownbyte.Saphire.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class MachineStatusMetricsResponse {
    private List<StatusCount> statusDistribution;

    @Data
    @Builder
    public static class StatusCount {
        private String status;
        private long count;
        private String color;
    }
}
