package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInstanceRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Route ID is required")
    private Long routeId;

    @NotNull(message = "Location ID is required")
    private Long locationId;

    private String serialNumber;

    private Integer priority;

    private LocalDateTime dueDate;

    private String notes;
}
