package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.TaskAssignmentRequest;
import com.crownbyte.Saphire.dto.request.TaskScheduleRequest;
import com.crownbyte.Saphire.dto.response.TaskAssignmentResponse;
import com.crownbyte.Saphire.dto.response.TaskScheduleResponse;
import com.crownbyte.Saphire.dto.response.UserResponse;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import com.crownbyte.Saphire.entity.qc.QcFormTemplateEntity;
import com.crownbyte.Saphire.entity.qc.TaskAssignmentEntity;
import com.crownbyte.Saphire.entity.qc.TaskScheduleEntity;
import com.crownbyte.Saphire.entity.qc.enums.TaskAssignmentTypeEnum;
import com.crownbyte.Saphire.repository.MachineRepository;
import com.crownbyte.Saphire.repository.ProductRepository;
import com.crownbyte.Saphire.repository.QcFormRecordRepository;
import com.crownbyte.Saphire.repository.QcFormTemplateRepository;
import com.crownbyte.Saphire.repository.TaskAssignmentRepository;
import com.crownbyte.Saphire.repository.UserRepository;
import com.crownbyte.Saphire.service.TaskAssignmentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TaskAssignmentServiceImpl implements TaskAssignmentService {

    private final TaskAssignmentRepository taskAssignmentRepository;
    private final QcFormTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final QcFormRecordRepository recordRepository;
    private final MachineRepository machineRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TaskAssignmentResponse> getAll(String search) {
        List<TaskAssignmentEntity> assignments;
        if (search != null && !search.trim().isEmpty()) {
            assignments = taskAssignmentRepository.findBySearch(search);
        } else {
            assignments = taskAssignmentRepository.findAll();
        }
        return assignments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public TaskAssignmentResponse create(TaskAssignmentRequest request) {
        QcFormTemplateEntity template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new EntityNotFoundException("Template not found with id: " + request.getTemplateId()));

        List<UserEntity> users = userRepository.findAllById(request.getUserIds());

        TaskAssignmentEntity entity = TaskAssignmentEntity.builder()
                .template(template)
                .type(request.getType())
                .machineId(request.getMachineId())
                .productId(request.getProductId())
                .active(true)
                .assignedUsers(users)
                .build();

        if (request.getSchedules() != null) {
            for (TaskScheduleRequest sReq : request.getSchedules()) {
                TaskScheduleEntity schedule = TaskScheduleEntity.builder()
                        .assignment(entity)
                        .dayOfWeek(sReq.getDayOfWeek())
                        .specificDate(sReq.getSpecificDate())
                        .startTime(sReq.getStartTime())
                        .endTime(sReq.getEndTime())
                        .build();
                entity.getSchedules().add(schedule);
            }
        }

        TaskAssignmentEntity saved = taskAssignmentRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public TaskAssignmentResponse update(Long id, TaskAssignmentRequest request) {
        TaskAssignmentEntity entity = taskAssignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found with id: " + id));

        QcFormTemplateEntity template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new EntityNotFoundException("Template not found with id: " + request.getTemplateId()));

        List<UserEntity> users = userRepository.findAllById(request.getUserIds());

        entity.setTemplate(template);
        entity.setType(request.getType());
        entity.setMachineId(request.getMachineId());
        entity.setProductId(request.getProductId());
        entity.setAssignedUsers(users);

        // Clear and rebuild schedules
        entity.getSchedules().clear();
        if (request.getSchedules() != null) {
            for (TaskScheduleRequest sReq : request.getSchedules()) {
                TaskScheduleEntity schedule = TaskScheduleEntity.builder()
                        .assignment(entity)
                        .dayOfWeek(sReq.getDayOfWeek())
                        .specificDate(sReq.getSpecificDate())
                        .startTime(sReq.getStartTime())
                        .endTime(sReq.getEndTime())
                        .build();
                entity.getSchedules().add(schedule);
            }
        }

        TaskAssignmentEntity saved = taskAssignmentRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        TaskAssignmentEntity entity = taskAssignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found with id: " + id));
        entity.setActive(false);
        taskAssignmentRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskAssignmentResponse> getActiveTasksForUser(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        LocalDate today = now.toLocalDate();
        int dayOfWeek = now.getDayOfWeek().getValue();

        List<TaskAssignmentEntity> assignments = taskAssignmentRepository.findActiveAssignmentsByUserId(userId);
        List<TaskAssignmentResponse> activeTasks = new ArrayList<>();

        for (TaskAssignmentEntity assignment : assignments) {
            for (TaskScheduleEntity schedule : assignment.getSchedules()) {
                boolean dateMatches = false;

                if (assignment.getType() == TaskAssignmentTypeEnum.RECURRING) {
                    if (schedule.getDayOfWeek() != null && schedule.getDayOfWeek() == dayOfWeek) {
                        dateMatches = true;
                    }
                } else if (assignment.getType() == TaskAssignmentTypeEnum.ONCE) {
                    if (schedule.getSpecificDate() != null && schedule.getSpecificDate().equals(today)) {
                        dateMatches = true;
                    }
                }

                if (dateMatches) {
                    // Check if already completed in this window
                    LocalDateTime windowStart = LocalDateTime.of(today, schedule.getStartTime());
                    LocalDateTime windowEnd = LocalDateTime.of(today, schedule.getEndTime());
                    
                    boolean alreadyDone = recordRepository.findByFilledById(userId).stream()
                            .anyMatch(record -> record.getTemplate().getId().equals(assignment.getTemplate().getId()) 
                                    && record.getCreatedAt().isAfter(windowStart) 
                                    && record.getCreatedAt().isBefore(windowEnd));
                    
                    if (!alreadyDone) {
                        activeTasks.add(toResponse(assignment));
                        break; // Found a matching schedule that hasn't been completed for today
                    }
                }
            }
        }

        return activeTasks;
    }

    private TaskAssignmentResponse toResponse(TaskAssignmentEntity entity) {
        String machineName = entity.getMachineId() != null ? 
                machineRepository.findById(entity.getMachineId()).map(m -> m.getName()).orElse(null) : null;
        String productName = entity.getProductId() != null ? 
                productRepository.findById(entity.getProductId()).map(p -> p.getName()).orElse(null) : null;

        return TaskAssignmentResponse.builder()
                .id(entity.getId())
                .templateId(entity.getTemplate().getId())
                .templateName(entity.getTemplate().getName())
                .templateCode(entity.getTemplate().getCode())
                .type(entity.getType())
                .machineId(entity.getMachineId())
                .machineName(machineName)
                .productId(entity.getProductId())
                .productName(productName)
                .active(entity.getActive())
                .assignedUsers(entity.getAssignedUsers().stream()
                        .map(u -> UserResponse.builder()
                                .id(u.getId())
                                .username(u.getUsername())
                                .fullName(u.getFullName())
                                .email(u.getEmail())
                                .role(u.getRole().name())
                                .active(u.getActive())
                                .build())
                        .collect(Collectors.toList()))
                .schedules(entity.getSchedules().stream()
                        .map(s -> TaskScheduleResponse.builder()
                                .id(s.getId())
                                .dayOfWeek(s.getDayOfWeek())
                                .specificDate(s.getSpecificDate())
                                .startTime(s.getStartTime())
                                .endTime(s.getEndTime())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }
}
