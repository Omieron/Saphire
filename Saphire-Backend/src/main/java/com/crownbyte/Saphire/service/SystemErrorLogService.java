package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.entity.SystemErrorLog;
import java.util.List;

public interface SystemErrorLogService {
    void logError(String ipAddress, String sourceClass, String description);

    List<SystemErrorLog> getAllLogs();
}
