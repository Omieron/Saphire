package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.QcFormRecordRequest;
import com.crownbyte.Saphire.dto.request.QcFormValueRequest;
import com.crownbyte.Saphire.dto.response.QcFormRecordResponse;
import com.crownbyte.Saphire.dto.response.QcFormValueResponse;
import com.crownbyte.Saphire.entity.master.CompanyEntity;
import com.crownbyte.Saphire.entity.master.MachineEntity;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.production.ProductInstanceEntity;
import com.crownbyte.Saphire.entity.production.ProductionStepEntity;
import com.crownbyte.Saphire.entity.qc.*;
import com.crownbyte.Saphire.entity.qc.enums.*;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;
import com.crownbyte.Saphire.repository.*;
import com.crownbyte.Saphire.service.impl.QcFormRecordServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class QcFormRecordService implements QcFormRecordServiceImpl {

    private final QcFormRecordRepository recordRepository;
    private final QcFormTemplateRepository templateRepository;
    private final QcFormFieldRepository fieldRepository;
    private final MachineRepository machineRepository;
    private final ProductInstanceRepository productInstanceRepository;
    private final ProductionStepRepository productionStepRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<QcFormRecordResponse> getAll(String search, String status, String templateName, String machineName, String userName, LocalDate startDate, LocalDate endDate) {
        Specification<QcFormRecordEntity> spec = (root, query, cb) -> {
            // ... (rest of spec remains same)
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String lSearch = "%" + search.toLowerCase() + "%";
                Join<QcFormRecordEntity, QcFormTemplateEntity> templateJoin = root.join("template", JoinType.LEFT);
                Join<QcFormRecordEntity, MachineEntity> machineJoin = root.join("machine", JoinType.LEFT);
                Join<QcFormRecordEntity, ProductInstanceEntity> instanceJoin = root.join("productInstance", JoinType.LEFT);
                Join<QcFormRecordEntity, UserEntity> userJoin = root.join("filledBy", JoinType.LEFT);

                List<Predicate> searchPredicates = new ArrayList<>();
                searchPredicates.add(cb.like(cb.lower(templateJoin.get("name")), lSearch));
                searchPredicates.add(cb.like(cb.lower(templateJoin.get("code")), lSearch));
                searchPredicates.add(cb.like(cb.lower(machineJoin.get("name")), lSearch));
                searchPredicates.add(cb.like(cb.lower(instanceJoin.get("serialNumber")), lSearch));
                searchPredicates.add(cb.like(cb.lower(userJoin.get("fullName")), lSearch));

                // Add ID search safely
                try {
                    Long idSearch = Long.parseLong(search.trim());
                    searchPredicates.add(cb.equal(root.get("id"), idSearch));
                } catch (NumberFormatException e) {
                    // Not a number, skip ID equality check
                }

                predicates.add(cb.or(searchPredicates.toArray(new Predicate[0])));
            }

            if (status != null && !status.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), RecordStatusEnum.valueOf(status.toUpperCase())));
            }

            if (templateName != null && !templateName.trim().isEmpty()) {
                predicates.add(cb.equal(root.join("template", JoinType.LEFT).get("name"), templateName));
            }

            if (machineName != null && !machineName.trim().isEmpty()) {
                Join<QcFormRecordEntity, MachineEntity> machineJoin = root.join("machine", JoinType.LEFT);
                Join<QcFormRecordEntity, ProductInstanceEntity> instanceJoin = root.join("productInstance", JoinType.LEFT);
                predicates.add(cb.or(
                    cb.equal(machineJoin.get("name"), machineName),
                    cb.equal(instanceJoin.get("serialNumber"), machineName)
                ));
            }

            if (userName != null && !userName.trim().isEmpty()) {
                predicates.add(cb.equal(root.join("filledBy", JoinType.LEFT).get("fullName"), userName));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("submittedAt"), startDate.atStartOfDay()));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("submittedAt"), endDate.atTime(LocalTime.MAX)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return recordRepository.findAll(spec)
                .stream()
                .map(e -> this.toResponse(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormRecordResponse> getByTemplateId(Long templateId) {
        return recordRepository.findByTemplateId(templateId)
                .stream()
                .map(e -> this.toResponse(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormRecordResponse> getByMachineId(Long machineId) {
        return recordRepository.findByMachineId(machineId)
                .stream()
                .map(e -> this.toResponse(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormRecordResponse> getByFilledById(Long userId) {
        return recordRepository.findByFilledById(userId)
                .stream()
                .map(e -> this.toResponse(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormRecordResponse> getByStatus(String status) {
        RecordStatusEnum statusEnum = RecordStatusEnum.valueOf(status.toUpperCase());
        return recordRepository.findByStatus(statusEnum)
                .stream()
                .map(e -> this.toResponse(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormRecordResponse> getByMachineIdAndStatus(Long machineId, String status) {
        RecordStatusEnum statusEnum = RecordStatusEnum.valueOf(status.toUpperCase());
        return recordRepository.findByMachineIdAndStatus(machineId, statusEnum)
                .stream()
                .map(e -> this.toResponse(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QcFormRecordResponse> getByDateRange(LocalDateTime start, LocalDateTime end) {
        return recordRepository.findByCreatedAtBetween(start, end)
                .stream()
                .map(e -> this.toResponse(e, false))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<QcFormRecordResponse> getById(Long id) {
        return recordRepository.findById(id)
                .map(e -> this.toResponse(e, true));
    }

    @Override
    public QcFormRecordResponse create(QcFormRecordRequest request, Long filledById) {
        // ... (creation logic)
        QcFormTemplateEntity template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(
                        () -> new EntityNotFoundException("Template not found with id: " + request.getTemplateId()));

        UserEntity filledBy = userRepository.findById(filledById)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + filledById));

        RecordStatusEnum status = RecordStatusEnum.SUBMITTED;

        QcFormRecordEntity entity = QcFormRecordEntity.builder()
                .template(template)
                .headerData(request.getHeaderData())
                .scheduledFor(request.getScheduledFor())
                .periodStart(request.getPeriodStart())
                .periodEnd(request.getPeriodEnd())
                .status(status)
                .filledBy(filledBy)
                .startedAt(LocalDateTime.now())
                .submittedAt(LocalDateTime.now())
                .notes(request.getNotes())
                .values(new ArrayList<>())
                .build();

        if (request.getMachineId() != null) {
            MachineEntity machine = machineRepository.findById(request.getMachineId())
                    .orElseThrow(
                            () -> new EntityNotFoundException("Machine not found with id: " + request.getMachineId()));
            entity.setMachine(machine);
        }

        if (request.getProductInstanceId() != null) {
            ProductInstanceEntity productInstance = productInstanceRepository.findById(request.getProductInstanceId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Product instance not found with id: " + request.getProductInstanceId()));
            entity.setProductInstance(productInstance);
        }

        if (request.getProductionStepId() != null) {
            ProductionStepEntity productionStep = productionStepRepository.findById(request.getProductionStepId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Production step not found with id: " + request.getProductionStepId()));
            entity.setProductionStep(productionStep);
        }

        if (request.getValues() != null) {
            for (QcFormValueRequest vReq : request.getValues()) {
                QcFormFieldEntity field = fieldRepository.findById(vReq.getFieldId())
                        .orElseThrow(
                                () -> new EntityNotFoundException("Field not found with id: " + vReq.getFieldId()));

                QcFormValueEntity value = QcFormValueEntity.builder()
                        .record(entity)
                        .field(field)
                        .repeatIndex(vReq.getRepeatIndex() != null ? vReq.getRepeatIndex() : 0)
                        .groupKey(vReq.getGroupKey())
                        .valueText(vReq.getValueText())
                        .valueNumber(vReq.getValueNumber())
                        .valueBoolean(vReq.getValueBoolean())
                        .valueJson(vReq.getValueJson())
                        .result(evaluateFieldResult(field, vReq))
                        .autoEvaluated(true)
                        .build();

                entity.getValues().add(value);
            }
        }

        entity.setOverallResult(calculateOverallResult(entity));

        QcFormRecordEntity saved = recordRepository.save(entity);
        return toResponse(saved, false);
    }

    @Override
    public QcFormRecordResponse submit(Long id) {
        QcFormRecordEntity entity = recordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found with id: " + id));

        entity.setStatus(RecordStatusEnum.SUBMITTED);
        entity.setSubmittedAt(LocalDateTime.now());
        entity.setOverallResult(calculateOverallResult(entity));

        QcFormRecordEntity saved = recordRepository.save(entity);
        return toResponse(saved, false);
    }

    @Override
    public QcFormRecordResponse approve(Long id, Long approvedById, String result) {
        QcFormRecordEntity entity = recordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found with id: " + id));

        UserEntity approvedBy = userRepository.findById(approvedById)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + approvedById));

        entity.setStatus(RecordStatusEnum.APPROVED);
        entity.setApprovedBy(approvedBy);
        entity.setApprovedAt(LocalDateTime.now());
        
        if (result != null && !result.isEmpty()) {
            entity.setOverallResult(OverallResultEnum.valueOf(result.toUpperCase()));
        } else {
            entity.setOverallResult(OverallResultEnum.PASS);
        }

        QcFormRecordEntity saved = recordRepository.save(entity);
        return toResponse(saved, false);
    }

    @Override
    public QcFormRecordResponse reject(Long id, Long rejectedById, String reason, String result) {
        QcFormRecordEntity entity = recordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found with id: " + id));

        entity.setStatus(RecordStatusEnum.REJECTED);
        entity.setRejectionReason(reason);
        
        if (result != null && !result.isEmpty()) {
            entity.setOverallResult(OverallResultEnum.valueOf(result.toUpperCase()));
        } else {
            entity.setOverallResult(OverallResultEnum.FAIL);
        }

        QcFormRecordEntity saved = recordRepository.save(entity);
        return toResponse(saved, false);
    }

    @Override
    public QcFormRecordResponse updateNotes(Long id, String notes) {
        QcFormRecordEntity entity = recordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Record not found with id: " + id));
 
        entity.setNotes(notes);
        QcFormRecordEntity saved = recordRepository.save(entity);
        return toResponse(saved, false);
    }

    private QcFormRecordResponse toResponse(QcFormRecordEntity entity, boolean includeLogo) {
        List<QcFormValueResponse> valuesResponse = entity.getValues()
                .stream()
                .map(v -> QcFormValueResponse.builder()
                        .id(v.getId())
                        .recordId(entity.getId())
                        .fieldId(v.getField().getId())
                        .fieldKey(v.getField().getFieldKey())
                        .fieldLabel(v.getField().getLabel())
                        .inputType(v.getField().getInputType().name())
                        .repeatIndex(v.getRepeatIndex())
                        .groupKey(v.getGroupKey())
                        .valueText(v.getValueText())
                        .valueNumber(v.getValueNumber())
                        .valueBoolean(v.getValueBoolean())
                        .valueJson(v.getValueJson())
                        .result(v.getResult() != null ? v.getResult().name() : null)
                        .autoEvaluated(v.getAutoEvaluated())
                        .enteredAt(v.getEnteredAt())
                        .build())
                .collect(Collectors.toList());

        CompanyEntity company = entity.getTemplate().getCompany();
        if (company == null && entity.getMachine() != null && entity.getMachine().getLocation() != null) {
            company = entity.getMachine().getLocation().getCompany();
        }
        if (company == null && entity.getProductInstance() != null && entity.getProductInstance().getLocation() != null) {
            company = entity.getProductInstance().getLocation().getCompany();
        }

        return QcFormRecordResponse.builder()
                .id(entity.getId())
                .templateId(entity.getTemplate().getId())
                .templateCode(entity.getTemplate().getCode())
                .templateName(entity.getTemplate().getName())
                .machineId(entity.getMachine() != null ? entity.getMachine().getId() : null)
                .machineName(entity.getMachine() != null ? entity.getMachine().getName() : null)
                .productInstanceId(entity.getProductInstance() != null ? entity.getProductInstance().getId() : null)
                .productInstanceSerial(
                        entity.getProductInstance() != null ? entity.getProductInstance().getSerialNumber() : null)
                .productionStepId(entity.getProductionStep() != null ? entity.getProductionStep().getId() : null)
                .headerData(entity.getHeaderData())
                .scheduledFor(entity.getScheduledFor())
                .periodStart(entity.getPeriodStart())
                .periodEnd(entity.getPeriodEnd())
                .status(entity.getStatus().name())
                .overallResult(entity.getOverallResult() != null ? entity.getOverallResult().name() : null)
                .filledById(entity.getFilledBy() != null ? entity.getFilledBy().getId() : null)
                .filledByName(entity.getFilledBy() != null ? entity.getFilledBy().getFullName() : null)
                .startedAt(entity.getStartedAt())
                .submittedAt(entity.getSubmittedAt())
                .approvedById(entity.getApprovedBy() != null ? entity.getApprovedBy().getId() : null)
                .approvedByName(entity.getApprovedBy() != null ? entity.getApprovedBy().getFullName() : null)
                .approvedAt(entity.getApprovedAt())
                .rejectionReason(entity.getRejectionReason())
                .notes(entity.getNotes())
                .values(valuesResponse)
                .companyId(company != null ? company.getId() : null)
                .companyLogo(includeLogo && company != null ? company.getLogo() : null)
                .createdAt(entity.getCreatedAt())
                .build();
    }

    @Override
    public void delete(Long id) {
        if (!recordRepository.existsById(id)) {
            throw new EntityNotFoundException("Record not found with id: " + id);
        }
        recordRepository.deleteById(id);
    }

    private ValueResultEnum evaluateFieldResult(QcFormFieldEntity field, QcFormValueRequest request) {
        if (request.getValueNumber() != null) {
            BigDecimal value = request.getValueNumber();

            if (field.getMinValue() != null && value.compareTo(field.getMinValue()) < 0) {
                return ValueResultEnum.FAIL;
            }
            if (field.getMaxValue() != null && value.compareTo(field.getMaxValue()) > 0) {
                return ValueResultEnum.FAIL;
            }

            if (field.getTargetValue() != null && field.getTolerance() != null) {
                BigDecimal diff = value.subtract(field.getTargetValue()).abs();
                if (diff.compareTo(field.getTolerance()) > 0) {
                    return ValueResultEnum.WARNING;
                }
            }

            return ValueResultEnum.PASS;
        }

        if (request.getValueBoolean() != null) {
            // For PASS_FAIL type, false means FAIL
            if (field.getInputType() == InputTypeEnum.PASS_FAIL) {
                return request.getValueBoolean() ? ValueResultEnum.PASS : ValueResultEnum.FAIL;
            }
        }

        return ValueResultEnum.PASS;
    }

    private OverallResultEnum calculateOverallResult(QcFormRecordEntity record) {
        boolean hasFail = false;
        boolean hasWarning = false;

        for (QcFormValueEntity value : record.getValues()) {
            if (value.getResult() == ValueResultEnum.FAIL) {
                hasFail = true;
            } else if (value.getResult() == ValueResultEnum.WARNING) {
                hasWarning = true;
            }
        }

        if (hasFail) {
            return OverallResultEnum.FAIL;
        } else if (hasWarning) {
            return OverallResultEnum.PARTIAL;
        }
        return OverallResultEnum.PASS;
    }
}
