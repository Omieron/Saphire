package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.QcFormRecordRequest;
import com.crownbyte.Saphire.dto.response.QcFormRecordResponse;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import com.crownbyte.Saphire.entity.qc.QcFormTemplateEntity;
import com.crownbyte.Saphire.entity.qc.enums.RecordStatusEnum;
import com.crownbyte.Saphire.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QcFormRecordServiceTest {

    @Mock
    private QcFormRecordRepository recordRepository;
    @Mock
    private QcFormTemplateRepository templateRepository;
    @Mock
    private QcFormFieldRepository fieldRepository;
    @Mock
    private MachineRepository machineRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private QcFormRecordService recordService;

    private QcFormRecordEntity recordEntity;
    private QcFormTemplateEntity templateEntity;
    private UserEntity userEntity;

    @BeforeEach
    void setUp() {
        templateEntity = new QcFormTemplateEntity();
        templateEntity.setId(1L);
        templateEntity.setName("Test Template");

        userEntity = UserEntity.builder().id(1L).fullName("Test User").build();

        recordEntity = QcFormRecordEntity.builder()
                .id(1L)
                .template(templateEntity)
                .status(RecordStatusEnum.SUBMITTED)
                .filledBy(userEntity)
                .values(new ArrayList<>())
                .build();
    }

    @Test
    void getById_ShouldReturnRecord() {
        when(recordRepository.findById(1L)).thenReturn(Optional.of(recordEntity));

        Optional<QcFormRecordResponse> result = recordService.getById(1L);

        assertTrue(result.isPresent());
        assertEquals(RecordStatusEnum.SUBMITTED.name(), result.get().getStatus());
        verify(recordRepository).findById(1L);
    }

    @Test
    void create_ShouldSaveRecord() {
        QcFormRecordRequest request = new QcFormRecordRequest();
        request.setTemplateId(1L);
        request.setValues(new ArrayList<>());

        when(templateRepository.findById(1L)).thenReturn(Optional.of(templateEntity));
        when(userRepository.findById(1L)).thenReturn(Optional.of(userEntity));
        when(recordRepository.save(any())).thenReturn(recordEntity);

        QcFormRecordResponse result = recordService.create(request, 1L);

        assertNotNull(result);
        verify(recordRepository).save(any());
    }

    @Test
    void approve_ShouldUpdateStatus() {
        when(recordRepository.findById(1L)).thenReturn(Optional.of(recordEntity));
        when(userRepository.findById(2L)).thenReturn(Optional.of(UserEntity.builder().id(2L).build()));
        when(recordRepository.save(any())).thenReturn(recordEntity);

        QcFormRecordResponse result = recordService.approve(1L, 2L, "PASS");

        assertEquals(RecordStatusEnum.APPROVED.name(), result.getStatus());
        verify(recordRepository).save(any());
    }

    @Test
    void reject_ShouldUpdateStatus() {
        when(recordRepository.findById(1L)).thenReturn(Optional.of(recordEntity));
        when(recordRepository.save(any())).thenReturn(recordEntity);

        QcFormRecordResponse result = recordService.reject(1L, 2L, "Poor quality", "FAIL");

        assertEquals(RecordStatusEnum.REJECTED.name(), result.getStatus());
        assertEquals("Poor quality", recordEntity.getRejectionReason());
        verify(recordRepository).save(any());
    }
}
