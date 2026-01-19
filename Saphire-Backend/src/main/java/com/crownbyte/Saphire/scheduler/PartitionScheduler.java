package com.crownbyte.Saphire.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Automatically creates new partitions for qc_form_records table.
 * Runs on the 1st of every month at 00:00.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class PartitionScheduler {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Creates partition for the next month.
     * Runs at midnight on the 1st of every month.
     * Also runs at application startup.
     */
    @Scheduled(cron = "0 0 0 1 * *") // Every month on the 1st at midnight
    public void createNextMonthPartition() {
        try {
            jdbcTemplate.execute("SELECT create_qc_records_partition()");
            log.info("Successfully created next month's partition for qc_form_records");
        } catch (Exception e) {
            log.error("Failed to create partition: {}", e.getMessage());
        }
    }
}
