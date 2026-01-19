package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRouteStepResponse {
    private Long id;
    private Long routeId;
    private Integer stepOrder;
    private String stepName;
    private String stepType;
    private Integer estimatedSetupMinutes;
    private Integer estimatedCycleMinutes;
    private List<RouteStepMachineResponse> machines;
}
