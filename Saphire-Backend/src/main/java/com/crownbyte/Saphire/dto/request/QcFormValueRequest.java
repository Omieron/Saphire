package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormValueRequest {

    @NotNull(message = "Field ID is required")
    private Long fieldId;

    private Integer repeatIndex;

    private String groupKey;

    private String valueText;

    private BigDecimal valueNumber;

    private Boolean valueBoolean;

    private Object valueJson;
}
