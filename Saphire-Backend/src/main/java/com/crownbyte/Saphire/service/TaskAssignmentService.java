package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.TaskAssignmentRequest;
import com.crownbyte.Saphire.dto.response.TaskAssignmentResponse;

import java.util.List;

public interface TaskAssignmentService {
    List<TaskAssignmentResponse> getAll(String search);
    TaskAssignmentResponse create(TaskAssignmentRequest request);
    TaskAssignmentResponse update(Long id, TaskAssignmentRequest request);
    void delete(Long id);
    List<TaskAssignmentResponse> getActiveTasksForUser(Long userId);
    TaskAssignmentResponse getById(Long id);
}
