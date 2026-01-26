package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.QcFormTemplateRequest;
import com.crownbyte.Saphire.dto.response.QcFormTemplateResponse;
import com.crownbyte.Saphire.entity.qc.QcFormTemplateEntity;
import com.crownbyte.Saphire.entity.qc.enums.ContextTypeEnum;
import com.crownbyte.Saphire.repository.CompanyRepository;
import com.crownbyte.Saphire.repository.MachineRepository;
import com.crownbyte.Saphire.repository.ProductRepository;
import com.crownbyte.Saphire.repository.QcFormTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QcFormTemplateServiceImplTest {

    @Mock
    private QcFormTemplateRepository templateRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private MachineRepository machineRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private QcFormTemplateServiceImpl templateService;

    private QcFormTemplateEntity templateEntity;

    @BeforeEach
    void setUp() {
        templateEntity = QcFormTemplateEntity.builder()
                .id(1L)
                .code("QC001")
                .name("Morning QC")
                .contextType(ContextTypeEnum.MACHINE)
                .active(true)
                .headerFields(new ArrayList<>())
                .sections(new ArrayList<>())
                .machines(new HashSet<>())
                .build();
    }

    @Test
    void getAll_ShouldReturnTemplates() {
        when(templateRepository.findAll()).thenReturn(Collections.singletonList(templateEntity));

        List<QcFormTemplateResponse> result = templateService.getAll(null);

        assertEquals(1, result.size());
        assertEquals("Morning QC", result.get(0).getName());
        verify(templateRepository).findAll();
    }

    @Test
    void create_ShouldSaveTemplate() {
        QcFormTemplateRequest request = new QcFormTemplateRequest();
        request.setCode("QC001");
        request.setName("Morning QC");
        request.setContextType("MACHINE");

        when(templateRepository.save(any())).thenReturn(templateEntity);

        QcFormTemplateResponse result = templateService.create(request);

        assertNotNull(result);
        assertEquals("QC001", result.getCode());
        verify(templateRepository).save(any());
    }

    @Test
    void delete_ShouldDeactivateTemplate() {
        when(templateRepository.findById(1L)).thenReturn(Optional.of(templateEntity));

        templateService.delete(1L);

        assertFalse(templateEntity.getActive());
        verify(templateRepository).save(templateEntity);
    }
}
