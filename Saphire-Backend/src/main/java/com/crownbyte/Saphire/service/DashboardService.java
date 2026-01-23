package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.response.dashboard.*;
import com.crownbyte.Saphire.entity.master.MachineStatusEntity;
import com.crownbyte.Saphire.entity.master.enums.MachineStatusEnum;
import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import com.crownbyte.Saphire.entity.qc.enums.OverallResultEnum;
import com.crownbyte.Saphire.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CompanyRepository companyRepository;
    private final LocationRepository locationRepository;
    private final MachineRepository machineRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final QcFormTemplateRepository templateRepository;
    private final QcFormRecordRepository recordRepository;
    private final TaskAssignmentRepository taskRepository;
    private final MachineStatusRepository machineStatusRepository;

    public DashboardDataResponse getDashboardData() {
        return DashboardDataResponse.builder()
                .summary(getSummary())
                .qcMetrics(getQcMetrics())
                .machineMetrics(getMachineMetrics())
                .productPerformance(getProductPerformance())
                .alerts(getCriticalAlerts())
                .activities(getRecentActivities())
                .build();
    }

    private DashboardSummaryResponse getSummary() {
        return DashboardSummaryResponse.builder()
                .totalCompanies(companyRepository.count())
                .totalLocations(locationRepository.count())
                .totalMachines(machineRepository.count())
                .totalProducts(productRepository.count())
                .totalUsers(userRepository.count())
                .totalQcTemplates(templateRepository.count())
                .activeTasks(taskRepository.count()) // Assuming all recorded tasks are active or just counting total for now
                .build();
    }

    private QcMetricsResponse getQcMetrics() {
        long total = recordRepository.count();
        long passed = recordRepository.countByOverallResult(OverallResultEnum.PASS);
        long failed = recordRepository.countByOverallResult(OverallResultEnum.FAIL);

        List<QcMetricsResponse.DailyMetric> trend = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (int i = 6; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = dayStart.plusDays(1).minusSeconds(1);
            trend.add(QcMetricsResponse.DailyMetric.builder()
                    .date(dayStart.format(DateTimeFormatter.ofPattern("EEE")))
                    .passed(recordRepository.countByOverallResultAndCreatedAtBetween(OverallResultEnum.PASS, dayStart, dayEnd))
                    .failed(recordRepository.countByOverallResultAndCreatedAtBetween(OverallResultEnum.FAIL, dayStart, dayEnd))
                    .build());
        }

        return QcMetricsResponse.builder()
                .totalRecords(total)
                .passedCount(passed)
                .failedCount(failed)
                .passRate(total == 0 ? 0 : (double) passed / total * 100)
                .weeklyTrend(trend)
                .build();
    }

    private MachineStatusMetricsResponse getMachineMetrics() {
        Map<MachineStatusEnum, Long> counts = machineStatusRepository.findAll().stream()
                .collect(Collectors.groupingBy(MachineStatusEntity::getCurrentStatus, Collectors.counting()));

        List<MachineStatusMetricsResponse.StatusCount> distribution = Arrays.stream(MachineStatusEnum.values())
                .map(status -> MachineStatusMetricsResponse.StatusCount.builder()
                        .status(status.name())
                        .count(counts.getOrDefault(status, 0L))
                        .color(getStatusColor(status))
                        .build())
                .collect(Collectors.toList());

        return MachineStatusMetricsResponse.builder()
                .statusDistribution(distribution)
                .build();
    }

    private String getStatusColor(MachineStatusEnum status) {
        return switch (status) {
            case RUNNING -> "#10b981"; // green-500
            case IDLE -> "#64748b"; // slate-500
            case MAINTENANCE -> "#f59e0b"; // amber-500
            case BREAKDOWN -> "#ef4444"; // red-500
            case OFFLINE -> "#94a3b8"; // slate-400
            case SETUP -> "#3b82f6"; // blue-500
        };
    }

    private List<DashboardDataResponse.ProductPerformance> getProductPerformance() {
        return recordRepository.getProductPerformanceStats().stream()
                .map(obj -> DashboardDataResponse.ProductPerformance.builder()
                        .productName((String) obj[0])
                        .totalQc((Long) obj[1])
                        .passRate((Long) obj[1] == 0 ? 0 : ((Number) obj[2]).doubleValue() / ((Number) obj[1]).doubleValue() * 100)
                        .build())
                .limit(5)
                .collect(Collectors.toList());
    }

    private List<DashboardDataResponse.CriticalAlert> getCriticalAlerts() {
        List<DashboardDataResponse.CriticalAlert> alerts = new ArrayList<>();
        
        // Example: Machine failure trend
        machineRepository.findAll().forEach(machine -> {
            List<QcFormRecordEntity> recent = recordRepository.findByMachineIdAndCreatedAtBetween(
                    machine.getId(), LocalDateTime.now().minusHours(24), LocalDateTime.now());
            
            long fails = recent.stream().filter(r -> r.getOverallResult() == OverallResultEnum.FAIL).count();
            if (fails >= 3) {
                alerts.add(DashboardDataResponse.CriticalAlert.builder()
                        .id("machine-fail-" + machine.getId())
                        .type("ERROR")
                        .title("Yüksek Hata Oranı: " + machine.getName())
                        .message("Bu makinede son 24 saatte " + fails + " adet hatalı QC kaydı tespit edildi.")
                        .timestamp(LocalDateTime.now())
                        .build());
            }
        });

        return alerts;
    }

    private List<DashboardDataResponse.RecentActivity> getRecentActivities() {
        return recordRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(record -> DashboardDataResponse.RecentActivity.builder()
                        .id(record.getId().toString())
                        .type("QC_RECORD")
                        .description(record.getTemplate().getName() + " - " + 
                                (record.getMachine() != null ? record.getMachine().getName() : "Genel"))
                        .userName(record.getFilledBy() != null ? record.getFilledBy().getFullName() : "Sistem")
                        .timestamp(record.getCreatedAt())
                        .status(record.getOverallResult() != null ? record.getOverallResult().name() : "PENDING")
                        .build())
                .collect(Collectors.toList());
    }
}
