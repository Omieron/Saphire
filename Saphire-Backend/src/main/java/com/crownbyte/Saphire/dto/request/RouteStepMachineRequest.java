package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteStepMachineRequest {

    @NotNull(message = "Machine ID is required")
    private Long machineId;

    private Long qcTemplateId;

    private Integer preferenceOrder;

    private String notes;
}
