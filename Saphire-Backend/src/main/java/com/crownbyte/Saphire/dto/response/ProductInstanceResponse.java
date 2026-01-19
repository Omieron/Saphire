package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInstanceResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productCode;
    private Long routeId;
    private String routeName;
    private Long locationId;
    private String locationName;
    private String serialNumber;
    private String status;
    private Integer priority;
    private LocalDateTime dueDate;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Long createdById;
    private String createdByName;
    private String notes;
    private List<ProductionStepResponse> productionSteps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
