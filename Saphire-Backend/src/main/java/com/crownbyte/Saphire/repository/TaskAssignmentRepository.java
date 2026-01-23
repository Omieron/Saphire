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

    @Query("SELECT DISTINCT ta FROM TaskAssignmentEntity ta " +
           "LEFT JOIN ta.template t " +
           "LEFT JOIN ta.assignedUsers u " +
           "WHERE (:search IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<TaskAssignmentEntity> findBySearch(@Param("search") String search);
}
