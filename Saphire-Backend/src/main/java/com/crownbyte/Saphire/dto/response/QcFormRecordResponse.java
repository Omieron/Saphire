package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormRecordResponse {
    private Long id;
    private Long templateId;
    private String templateCode;
    private String templateName;
    private Long machineId;
    private String machineName;
    private Long productInstanceId;
    private String productInstanceSerialNumber;
    private Long productionStepId;
    private Map<String, Object> headerData;
    private LocalDateTime scheduledFor;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
    private String status;
    private String overallResult;
    private Long filledById;
    private String filledByName;
    private LocalDateTime startedAt;
    private LocalDateTime submittedAt;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectionReason;
    private String notes;
    private List<QcFormValueResponse> values;
    private LocalDateTime createdAt;
}
