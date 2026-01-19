package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.*;
import com.crownbyte.Saphire.dto.response.*;
import com.crownbyte.Saphire.entity.master.*;
import com.crownbyte.Saphire.entity.qc.*;
import com.crownbyte.Saphire.entity.qc.enums.*;
import com.crownbyte.Saphire.repository.*;
import com.crownbyte.Saphire.service.impl.QcFormTemplateServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QcFormTemplateService implements QcFormTemplateServiceImpl {

    private final QcFormTemplateRepository templateRepository;
    private final CompanyRepository companyRepository;
    private final MachineRepository machineRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QcFormTemplateResponse> getAll() {
        return templateRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormTemplateResponse> getActive() {
        return templateRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormTemplateResponse> getByCompanyId(Long companyId) {
        return templateRepository.findByCompanyId(companyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormTemplateResponse> getByMachineId(Long machineId) {
        return templateRepository.findByMachineId(machineId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormTemplateResponse> getByProductId(Long productId) {
        return templateRepository.findByProductId(productId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormTemplateResponse> getByContextType(String contextType) {
        ContextTypeEnum contextTypeEnum = ContextTypeEnum.valueOf(contextType.toUpperCase());
        return templateRepository.findByContextTypeAndActiveTrue(contextTypeEnum)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<QcFormTemplateResponse> getById(Long id) {
        return templateRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<QcFormTemplateResponse> getByCode(String code) {
        return templateRepository.findByCode(code)
                .map(this::toResponse);
    }

    @Override
    public QcFormTemplateResponse create(QcFormTemplateRequest request) {
        QcFormTemplateEntity entity = QcFormTemplateEntity.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .contextType(ContextTypeEnum.valueOf(request.getContextType().toUpperCase()))
                .scheduleType(request.getScheduleType() != null
                        ? ScheduleTypeEnum.valueOf(request.getScheduleType().toUpperCase())
                        : ScheduleTypeEnum.ON_DEMAND)
                .scheduleConfig(request.getScheduleConfig())
                .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : false)
                .allowPartialSave(request.getAllowPartialSave() != null ? request.getAllowPartialSave() : true)
                .active(request.getActive() != null ? request.getActive() : true)
                .headerFields(new ArrayList<>())
                .sections(new ArrayList<>())
                .build();

        if (request.getCompanyId() != null) {
            CompanyEntity company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Company not found with id: " + request.getCompanyId()));
            entity.setCompany(company);
        }

        if (request.getMachineId() != null) {
            MachineEntity machine = machineRepository.findById(request.getMachineId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Machine not found with id: " + request.getMachineId()));
            entity.setMachine(machine);
        }

        if (request.getProductId() != null) {
            ProductEntity product = productRepository.findById(request.getProductId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));
            entity.setProduct(product);
        }

        // Add header fields
        if (request.getHeaderFields() != null) {
            for (QcFormHeaderFieldRequest hfReq : request.getHeaderFields()) {
                QcFormHeaderFieldEntity headerField = QcFormHeaderFieldEntity.builder()
                        .template(entity)
                        .fieldOrder(hfReq.getFieldOrder())
                        .fieldKey(hfReq.getFieldKey())
                        .label(hfReq.getLabel())
                        .fieldType(HeaderFieldTypeEnum.valueOf(hfReq.getFieldType().toUpperCase()))
                        .options(hfReq.getOptions())
                        .required(hfReq.getRequired() != null ? hfReq.getRequired() : true)
                        .defaultValue(hfReq.getDefaultValue())
                        .build();
                entity.getHeaderFields().add(headerField);
            }
        }

        // Add sections and fields
        if (request.getSections() != null) {
            for (QcFormSectionRequest sReq : request.getSections()) {
                QcFormSectionEntity section = QcFormSectionEntity.builder()
                        .template(entity)
                        .sectionOrder(sReq.getSectionOrder())
                        .name(sReq.getName())
                        .description(sReq.getDescription())
                        .isRepeatable(sReq.getIsRepeatable() != null ? sReq.getIsRepeatable() : false)
                        .repeatCount(sReq.getRepeatCount())
                        .repeatLabelPattern(sReq.getRepeatLabelPattern())
                        .hasGroups(sReq.getHasGroups() != null ? sReq.getHasGroups() : false)
                        .groupLabels(sReq.getGroupLabels())
                        .fields(new ArrayList<>())
                        .build();

                if (sReq.getFields() != null) {
                    for (QcFormFieldRequest fReq : sReq.getFields()) {
                        QcFormFieldEntity field = QcFormFieldEntity.builder()
                                .section(section)
                                .fieldOrder(fReq.getFieldOrder())
                                .fieldKey(fReq.getFieldKey())
                                .label(fReq.getLabel())
                                .inputType(InputTypeEnum.valueOf(fReq.getInputType().toUpperCase()))
                                .minValue(fReq.getMinValue())
                                .maxValue(fReq.getMaxValue())
                                .targetValue(fReq.getTargetValue())
                                .tolerance(fReq.getTolerance())
                                .unit(fReq.getUnit())
                                .decimalPlaces(fReq.getDecimalPlaces() != null ? fReq.getDecimalPlaces() : 2)
                                .options(fReq.getOptions())
                                .required(fReq.getRequired() != null ? fReq.getRequired() : true)
                                .failCondition(fReq.getFailCondition())
                                .helpText(fReq.getHelpText())
                                .placeholder(fReq.getPlaceholder())
                                .width(fReq.getWidth() != null ? fReq.getWidth() : "full")
                                .build();
                        section.getFields().add(field);
                    }
                }
                entity.getSections().add(section);
            }
        }

        QcFormTemplateEntity saved = templateRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public QcFormTemplateResponse update(Long id, QcFormTemplateRequest request) {
        QcFormTemplateEntity entity = templateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("QC Template not found with id: " + id));

        // Update basic properties
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setContextType(ContextTypeEnum.valueOf(request.getContextType().toUpperCase()));

        if (request.getScheduleType() != null) {
            entity.setScheduleType(ScheduleTypeEnum.valueOf(request.getScheduleType().toUpperCase()));
        }
        entity.setScheduleConfig(request.getScheduleConfig());

        if (request.getRequiresApproval() != null) {
            entity.setRequiresApproval(request.getRequiresApproval());
        }
        if (request.getAllowPartialSave() != null) {
            entity.setAllowPartialSave(request.getAllowPartialSave());
        }
        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }

        // Update company/machine/product associations
        if (request.getCompanyId() != null) {
            CompanyEntity company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Company not found with id: " + request.getCompanyId()));
            entity.setCompany(company);
        }

        if (request.getMachineId() != null) {
            MachineEntity machine = machineRepository.findById(request.getMachineId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Machine not found with id: " + request.getMachineId()));
            entity.setMachine(machine);
        }

        if (request.getProductId() != null) {
            ProductEntity product = productRepository.findById(request.getProductId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));
            entity.setProduct(product);
        }

        // Clear and rebuild headerFields
        entity.getHeaderFields().clear();
        if (request.getHeaderFields() != null) {
            for (QcFormHeaderFieldRequest hfReq : request.getHeaderFields()) {
                QcFormHeaderFieldEntity headerField = QcFormHeaderFieldEntity.builder()
                        .template(entity)
                        .fieldOrder(hfReq.getFieldOrder())
                        .fieldKey(hfReq.getFieldKey())
                        .label(hfReq.getLabel())
                        .fieldType(HeaderFieldTypeEnum.valueOf(hfReq.getFieldType().toUpperCase()))
                        .options(hfReq.getOptions())
                        .required(hfReq.getRequired() != null ? hfReq.getRequired() : true)
                        .defaultValue(hfReq.getDefaultValue())
                        .build();
                entity.getHeaderFields().add(headerField);
            }
        }

        // Clear and rebuild sections with their fields
        entity.getSections().clear();
        if (request.getSections() != null) {
            for (QcFormSectionRequest sReq : request.getSections()) {
                QcFormSectionEntity section = QcFormSectionEntity.builder()
                        .template(entity)
                        .sectionOrder(sReq.getSectionOrder())
                        .name(sReq.getName())
                        .description(sReq.getDescription())
                        .isRepeatable(sReq.getIsRepeatable() != null ? sReq.getIsRepeatable() : false)
                        .repeatCount(sReq.getRepeatCount())
                        .repeatLabelPattern(sReq.getRepeatLabelPattern())
                        .hasGroups(sReq.getHasGroups() != null ? sReq.getHasGroups() : false)
                        .groupLabels(sReq.getGroupLabels())
                        .fields(new ArrayList<>())
                        .build();

                if (sReq.getFields() != null) {
                    for (QcFormFieldRequest fReq : sReq.getFields()) {
                        QcFormFieldEntity field = QcFormFieldEntity.builder()
                                .section(section)
                                .fieldOrder(fReq.getFieldOrder())
                                .fieldKey(fReq.getFieldKey())
                                .label(fReq.getLabel())
                                .inputType(InputTypeEnum.valueOf(fReq.getInputType().toUpperCase()))
                                .minValue(fReq.getMinValue())
                                .maxValue(fReq.getMaxValue())
                                .targetValue(fReq.getTargetValue())
                                .tolerance(fReq.getTolerance())
                                .unit(fReq.getUnit())
                                .decimalPlaces(fReq.getDecimalPlaces() != null ? fReq.getDecimalPlaces() : 2)
                                .options(fReq.getOptions())
                                .required(fReq.getRequired() != null ? fReq.getRequired() : true)
                                .failCondition(fReq.getFailCondition())
                                .helpText(fReq.getHelpText())
                                .placeholder(fReq.getPlaceholder())
                                .width(fReq.getWidth() != null ? fReq.getWidth() : "full")
                                .build();
                        section.getFields().add(field);
                    }
                }
                entity.getSections().add(section);
            }
        }

        entity.setVersion(entity.getVersion() + 1);

        QcFormTemplateEntity saved = templateRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new EntityNotFoundException("QC Template not found with id: " + id);
        }
        templateRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCode(String code) {
        return templateRepository.existsByCode(code);
    }

    private QcFormTemplateResponse toResponse(QcFormTemplateEntity entity) {
        List<QcFormHeaderFieldResponse> headerFieldsResponse = entity.getHeaderFields()
                .stream()
                .map(hf -> QcFormHeaderFieldResponse.builder()
                        .id(hf.getId())
                        .templateId(entity.getId())
                        .fieldOrder(hf.getFieldOrder())
                        .fieldKey(hf.getFieldKey())
                        .label(hf.getLabel())
                        .fieldType(hf.getFieldType().name())
                        .options(hf.getOptions())
                        .required(hf.getRequired())
                        .defaultValue(hf.getDefaultValue())
                        .build())
                .collect(Collectors.toList());

        List<QcFormSectionResponse> sectionsResponse = entity.getSections()
                .stream()
                .map(s -> {
                    List<QcFormFieldResponse> fieldsResponse = s.getFields()
                            .stream()
                            .map(f -> QcFormFieldResponse.builder()
                                    .id(f.getId())
                                    .sectionId(s.getId())
                                    .fieldOrder(f.getFieldOrder())
                                    .fieldKey(f.getFieldKey())
                                    .label(f.getLabel())
                                    .inputType(f.getInputType().name())
                                    .minValue(f.getMinValue())
                                    .maxValue(f.getMaxValue())
                                    .targetValue(f.getTargetValue())
                                    .tolerance(f.getTolerance())
                                    .unit(f.getUnit())
                                    .decimalPlaces(f.getDecimalPlaces())
                                    .options(f.getOptions())
                                    .required(f.getRequired())
                                    .failCondition(f.getFailCondition())
                                    .helpText(f.getHelpText())
                                    .placeholder(f.getPlaceholder())
                                    .width(f.getWidth())
                                    .build())
                            .collect(Collectors.toList());

                    return QcFormSectionResponse.builder()
                            .id(s.getId())
                            .templateId(entity.getId())
                            .sectionOrder(s.getSectionOrder())
                            .name(s.getName())
                            .description(s.getDescription())
                            .isRepeatable(s.getIsRepeatable())
                            .repeatCount(s.getRepeatCount())
                            .repeatLabelPattern(s.getRepeatLabelPattern())
                            .hasGroups(s.getHasGroups())
                            .groupLabels(s.getGroupLabels())
                            .fields(fieldsResponse)
                            .build();
                })
                .collect(Collectors.toList());

        return QcFormTemplateResponse.builder()
                .id(entity.getId())
                .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
                .companyName(entity.getCompany() != null ? entity.getCompany().getName() : null)
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .contextType(entity.getContextType().name())
                .machineId(entity.getMachine() != null ? entity.getMachine().getId() : null)
                .machineName(entity.getMachine() != null ? entity.getMachine().getName() : null)
                .productId(entity.getProduct() != null ? entity.getProduct().getId() : null)
                .productName(entity.getProduct() != null ? entity.getProduct().getName() : null)
                .scheduleType(entity.getScheduleType().name())
                .scheduleConfig(entity.getScheduleConfig())
                .requiresApproval(entity.getRequiresApproval())
                .allowPartialSave(entity.getAllowPartialSave())
                .version(entity.getVersion())
                .active(entity.getActive())
                .createdById(entity.getCreatedBy() != null ? entity.getCreatedBy().getId() : null)
                .createdByName(entity.getCreatedBy() != null ? entity.getCreatedBy().getFullName() : null)
                .headerFields(headerFieldsResponse)
                .sections(sectionsResponse)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
