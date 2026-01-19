package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRouteResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productCode;
    private String name;
    private Integer version;
    private Boolean active;
    private List<ProductRouteStepResponse> steps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
