package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRouteStepRequest {

    @NotNull(message = "Step order is required")
    private Integer stepOrder;

    @NotBlank(message = "Step name is required")
    private String stepName;

    private String stepType;

    private Integer estimatedSetupMinutes;

    private Integer estimatedCycleMinutes;

    private List<RouteStepMachineRequest> machines;
}
