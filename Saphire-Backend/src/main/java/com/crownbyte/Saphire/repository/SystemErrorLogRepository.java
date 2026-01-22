package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.SystemErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemErrorLogRepository extends JpaRepository<SystemErrorLog, Long> {
}
