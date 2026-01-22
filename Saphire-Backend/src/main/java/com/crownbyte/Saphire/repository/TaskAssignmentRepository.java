package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.qc.TaskAssignmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignmentEntity, Long> {
    
    @Query("SELECT ta FROM TaskAssignmentEntity ta JOIN ta.assignedUsers u WHERE u.id = :userId AND ta.active = true")
    List<TaskAssignmentEntity> findActiveAssignmentsByUserId(@Param("userId") Long userId);
}
