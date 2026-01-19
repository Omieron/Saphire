package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormRecordRequest {

    @NotNull(message = "Template ID is required")
    private Long templateId;

    private Long machineId;

    private Long productInstanceId;

    private Long productionStepId;

    @NotNull(message = "Header data is required")
    private Map<String, Object> headerData;

    private LocalDateTime scheduledFor;

    private LocalDateTime periodStart;

    private LocalDateTime periodEnd;

    private String notes;

    private List<QcFormValueRequest> values;
}
