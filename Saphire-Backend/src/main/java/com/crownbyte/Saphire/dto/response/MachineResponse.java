package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineResponse {
    private Long id;
    private Long locationId;
    private String locationName;
    private String code;
    private String name;
    private String type;
    private Boolean active;
    private Boolean maintenanceMode;
    private MachineStatusResponse status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
