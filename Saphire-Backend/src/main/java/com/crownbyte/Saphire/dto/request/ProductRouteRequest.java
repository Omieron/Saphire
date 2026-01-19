package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRouteRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String name;

    private Integer version;

    private Boolean active;

    private List<ProductRouteStepRequest> steps;
}
