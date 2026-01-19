package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineRequest {

    @NotNull(message = "Location ID is required")
    private Long locationId;

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Name is required")
    private String name;

    private String type;

    private Boolean active;

    private Boolean maintenanceMode;
}
