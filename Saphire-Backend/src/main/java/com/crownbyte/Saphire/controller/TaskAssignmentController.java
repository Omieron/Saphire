package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.request.TaskAssignmentRequest;
import com.crownbyte.Saphire.dto.response.ApiResponse;
import com.crownbyte.Saphire.dto.response.TaskAssignmentResponse;
import com.crownbyte.Saphire.service.TaskAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/task-assignments")
@RequiredArgsConstructor
public class TaskAssignmentController {

    private final TaskAssignmentService taskAssignmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskAssignmentResponse>>> getAll(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(taskAssignmentService.getAll(search)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TaskAssignmentResponse>> create(@RequestBody TaskAssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taskAssignmentService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskAssignmentResponse>> update(@PathVariable Long id, @RequestBody TaskAssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(taskAssignmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        taskAssignmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/active/{userId}")
    public ResponseEntity<ApiResponse<List<TaskAssignmentResponse>>> getActiveTasks(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(taskAssignmentService.getActiveTasksForUser(userId)));
    }
}
