package com.crownbyte.Saphire.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteStepMachineResponse {
    private Long id;
    private Long routeStepId;
    private Long machineId;
    private String machineName;
    private String machineCode;
    private Long qcTemplateId;
    private String qcTemplateName;
    private Integer preferenceOrder;
    private String notes;
}
