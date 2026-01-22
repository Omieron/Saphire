package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.entity.SystemErrorLog;
import com.crownbyte.Saphire.repository.SystemErrorLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemErrorLogService {

    private final SystemErrorLogRepository repository;

    @Transactional
    public void logError(String ipAddress, String sourceClass, String description) {
        SystemErrorLog log = SystemErrorLog.builder()
                .ipAddress(ipAddress)
                .sourceClass(sourceClass)
                .description(description)
                .build();
        repository.save(log);
    }

    public List<SystemErrorLog> getAllLogs() {
        return repository.findAll();
    }
}
