package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.*;
import com.crownbyte.Saphire.dto.response.*;
import com.crownbyte.Saphire.entity.master.*;
import com.crownbyte.Saphire.entity.qc.*;
import com.crownbyte.Saphire.entity.qc.enums.*;
import com.crownbyte.Saphire.repository.*;
import com.crownbyte.Saphire.service.QcFormTemplateService;
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
public class QcFormTemplateServiceImpl implements QcFormTemplateService {

    private final QcFormTemplateRepository templateRepository;
    private final CompanyRepository companyRepository;
    private final MachineRepository machineRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QcFormTemplateResponse> getAll(String search) {
        List<QcFormTemplateEntity> templates;
        if (search != null && !search.trim().isEmpty()) {
            templates = templateRepository.findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(search, search);
        } else {
            templates = templateRepository.findAll();
        }
        return templates.stream()
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
        return templateRepository.findByMachinesId(machineId)
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

        if (request.getMachineIds() != null && !request.getMachineIds().isEmpty()) {
            List<MachineEntity> machines = machineRepository.findAllById(request.getMachineIds());
            if (machines.size() != request.getMachineIds().size()) {
                throw new EntityNotFoundException("Some machines were not found");
            }
            entity.getMachines().addAll(machines);
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

        if (request.getMachineIds() != null) {
            List<MachineEntity> machines = machineRepository.findAllById(request.getMachineIds());
            if (machines.size() != request.getMachineIds().size()) {
                throw new EntityNotFoundException("Some machines were not found");
            }
            entity.getMachines().clear();
            entity.getMachines().addAll(machines);
        }

        if (request.getProductId() != null) {
            ProductEntity product = productRepository.findById(request.getProductId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));
            entity.setProduct(product);
        }

        // Smart Sync for Header Fields
        if (request.getHeaderFields() != null) {
            List<QcFormHeaderFieldEntity> existingHeaders = new ArrayList<>(entity.getHeaderFields());
            // Mark all existing as inactive initially, then reactivate matched ones
            existingHeaders.forEach(h -> h.setActive(false));

            for (QcFormHeaderFieldRequest hfReq : request.getHeaderFields()) {
                QcFormHeaderFieldEntity headerField = existingHeaders.stream()
                        .filter(h -> h.getFieldKey().equals(hfReq.getFieldKey()))
                        .findFirst()
                        .orElse(null);

                if (headerField == null) {
                    headerField = QcFormHeaderFieldEntity.builder().template(entity).build();
                    entity.getHeaderFields().add(headerField);
                }

                headerField.setFieldOrder(hfReq.getFieldOrder());
                headerField.setFieldKey(hfReq.getFieldKey());
                headerField.setLabel(hfReq.getLabel());
                headerField.setFieldType(HeaderFieldTypeEnum.valueOf(hfReq.getFieldType().toUpperCase()));
                headerField.setOptions(hfReq.getOptions());
                headerField.setRequired(hfReq.getRequired() != null ? hfReq.getRequired() : true);
                headerField.setDefaultValue(hfReq.getDefaultValue());
                headerField.setActive(true);
            }
        } else {
            entity.getHeaderFields().forEach(h -> h.setActive(false));
        }

        // Smart Sync for Sections and Fields
        if (request.getSections() != null) {
            List<QcFormSectionEntity> existingSections = new ArrayList<>(entity.getSections());
            existingSections.forEach(s -> s.setActive(false));

            for (QcFormSectionRequest sReq : request.getSections()) {
                // Match section by name OR order (name is safer if provided)
                QcFormSectionEntity section = existingSections.stream()
                        .filter(s -> s.getName().equals(sReq.getName()))
                        .findFirst()
                        .orElse(null);

                if (section == null) {
                    section = QcFormSectionEntity.builder()
                            .template(entity)
                            .fields(new ArrayList<>())
                            .build();
                    entity.getSections().add(section);
                }

                section.setSectionOrder(sReq.getSectionOrder());
                section.setName(sReq.getName());
                section.setDescription(sReq.getDescription());
                section.setIsRepeatable(sReq.getIsRepeatable() != null ? sReq.getIsRepeatable() : false);
                section.setRepeatCount(sReq.getRepeatCount());
                section.setRepeatLabelPattern(sReq.getRepeatLabelPattern());
                section.setHasGroups(sReq.getHasGroups() != null ? sReq.getHasGroups() : false);
                section.setGroupLabels(sReq.getGroupLabels());
                section.setActive(true);

                // Sync fields within this section
                if (sReq.getFields() != null) {
                    List<QcFormFieldEntity> existingFields = new ArrayList<>(section.getFields());
                    existingFields.forEach(f -> f.setActive(false));

                    for (QcFormFieldRequest fReq : sReq.getFields()) {
                        QcFormFieldEntity field = existingFields.stream()
                                .filter(f -> f.getFieldKey().equals(fReq.getFieldKey()))
                                .findFirst()
                                .orElse(null);

                        if (field == null) {
                            field = QcFormFieldEntity.builder().section(section).build();
                            section.getFields().add(field);
                        }

                        field.setFieldOrder(fReq.getFieldOrder());
                        field.setFieldKey(fReq.getFieldKey());
                        field.setLabel(fReq.getLabel());
                        field.setInputType(InputTypeEnum.valueOf(fReq.getInputType().toUpperCase()));
                        field.setMinValue(fReq.getMinValue());
                        field.setMaxValue(fReq.getMaxValue());
                        field.setTargetValue(fReq.getTargetValue());
                        field.setTolerance(fReq.getTolerance());
                        field.setUnit(fReq.getUnit());
                        field.setDecimalPlaces(fReq.getDecimalPlaces() != null ? fReq.getDecimalPlaces() : 2);
                        field.setOptions(fReq.getOptions());
                        field.setRequired(fReq.getRequired() != null ? fReq.getRequired() : true);
                        field.setFailCondition(fReq.getFailCondition());
                        field.setHelpText(fReq.getHelpText());
                        field.setPlaceholder(fReq.getPlaceholder());
                        field.setWidth(fReq.getWidth() != null ? fReq.getWidth() : "full");
                        field.setActive(true);
                    }
                } else {
                    section.getFields().forEach(f -> f.setActive(false));
                }
            }
        } else {
            entity.getSections().forEach(s -> s.setActive(false));
        }

        entity.setVersion(entity.getVersion() + 1);

        QcFormTemplateEntity saved = templateRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        QcFormTemplateEntity entity = templateRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("QC Template not found with id: " + id));
        entity.setActive(false);
        templateRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByCode(String code) {
        return templateRepository.existsByCode(code);
    }

    private QcFormTemplateResponse toResponse(QcFormTemplateEntity entity) {
        List<QcFormHeaderFieldResponse> headerFieldsResponse = entity.getHeaderFields()
                .stream()
                .filter(QcFormHeaderFieldEntity::getActive)
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
                .filter(QcFormSectionEntity::getActive)
                .map(s -> {
                    List<QcFormFieldResponse> fieldsResponse = s.getFields()
                            .stream()
                            .filter(QcFormFieldEntity::getActive)
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
                .machineIds(entity.getMachines().stream().map(MachineEntity::getId).collect(Collectors.toList()))
                .machineNames(
                        entity.getMachines().stream().map(MachineEntity::getName).collect(Collectors.joining(", ")))
                .machineCodes(
                        entity.getMachines().stream().map(MachineEntity::getCode).collect(Collectors.joining(", ")))
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
