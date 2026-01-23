package com.crownbyte.Saphire.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardSummaryResponse {
    private long totalCompanies;
    private long totalLocations;
    private long totalMachines;
    private long totalProducts;
    private long totalUsers;
    private long totalQcTemplates;
    private long activeTasks;
}
