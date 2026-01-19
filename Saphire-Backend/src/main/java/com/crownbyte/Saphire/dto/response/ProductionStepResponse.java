package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionStepResponse {
    private Long id;
    private Long productInstanceId;
    private Long routeStepId;
    private String stepName;
    private Integer stepOrder;
    private Long machineId;
    private String machineName;
    private String machineCode;
    private Long operatorId;
    private String operatorName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Integer retryCount;
    private String failureReason;
    private String correctiveAction;
    private String notes;
}
