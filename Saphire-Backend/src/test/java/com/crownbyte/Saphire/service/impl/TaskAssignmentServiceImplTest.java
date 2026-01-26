package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.TaskAssignmentRequest;
import com.crownbyte.Saphire.dto.response.TaskAssignmentResponse;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.qc.QcFormTemplateEntity;
import com.crownbyte.Saphire.entity.qc.TaskAssignmentEntity;
import com.crownbyte.Saphire.repository.MachineRepository;
import com.crownbyte.Saphire.repository.ProductRepository;
import com.crownbyte.Saphire.repository.QcFormRecordRepository;
import com.crownbyte.Saphire.repository.QcFormTemplateRepository;
import com.crownbyte.Saphire.repository.TaskAssignmentRepository;
import com.crownbyte.Saphire.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskAssignmentServiceImplTest {

    @Mock
    private TaskAssignmentRepository taskAssignmentRepository;
    @Mock
    private QcFormTemplateRepository templateRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private QcFormRecordRepository recordRepository;
    @Mock
    private MachineRepository machineRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private TaskAssignmentServiceImpl taskAssignmentService;

    private TaskAssignmentEntity assignmentEntity;
    private QcFormTemplateEntity templateEntity;

    @BeforeEach
    void setUp() {
        templateEntity = new QcFormTemplateEntity();
        templateEntity.setId(1L);
        templateEntity.setName("Test Template");
        templateEntity.setCode("T001");

        assignmentEntity = TaskAssignmentEntity.builder()
                .id(1L)
                .template(templateEntity)
                .active(true)
                .assignedUsers(new ArrayList<>())
                .schedules(new ArrayList<>())
                .build();
    }

    @Test
    void getAll_ShouldReturnListOfAssignments() {
        when(taskAssignmentRepository.findAll()).thenReturn(Collections.singletonList(assignmentEntity));

        List<TaskAssignmentResponse> result = taskAssignmentService.getAll(null);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Template", result.get(0).getTemplateName());
        verify(taskAssignmentRepository, times(1)).findAll();
    }

    @Test
    void create_ShouldSaveAndReturnResponse() {
        TaskAssignmentRequest request = new TaskAssignmentRequest();
        request.setTemplateId(1L);
        request.setUserIds(Collections.singletonList(1L));

        when(templateRepository.findById(1L)).thenReturn(Optional.of(templateEntity));
        when(userRepository.findAllById(any())).thenReturn(Collections.singletonList(new UserEntity()));
        when(taskAssignmentRepository.save(any())).thenReturn(assignmentEntity);

        TaskAssignmentResponse result = taskAssignmentService.create(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(taskAssignmentRepository, times(1)).save(any());
    }

    @Test
    void delete_ShouldDeactivateAssignment() {
        when(taskAssignmentRepository.findById(1L)).thenReturn(Optional.of(assignmentEntity));

        taskAssignmentService.delete(1L);

        assertFalse(assignmentEntity.getActive());
        verify(taskAssignmentRepository, times(1)).save(assignmentEntity);
    }

    @Test
    void getById_ShouldThrowException_WhenNotFound() {
        when(taskAssignmentRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> taskAssignmentService.getById(1L));
    }
}
