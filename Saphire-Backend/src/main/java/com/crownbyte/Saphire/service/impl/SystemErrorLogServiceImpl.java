package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.entity.SystemErrorLog;
import com.crownbyte.Saphire.repository.SystemErrorLogRepository;
import com.crownbyte.Saphire.service.SystemErrorLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SystemErrorLogServiceImpl implements SystemErrorLogService {

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
