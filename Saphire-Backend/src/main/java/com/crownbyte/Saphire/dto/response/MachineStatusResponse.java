package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineStatusResponse {
    private Long id;
    private Long machineId;
    private String currentStatus;
    private Long currentInstanceId;
    private Long currentStepId;
    private Long currentOperatorId;
    private String currentOperatorName;
    private LocalDateTime statusSince;
    private LocalDateTime estimatedFinishAt;
}
