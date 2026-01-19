package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionStepUpdateRequest {

    @NotNull(message = "Status is required")
    private String status;

    private Long operatorId;

    private String failureReason;

    private String correctiveAction;

    private String notes;
}
