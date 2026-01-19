package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormFieldRequest {

    @NotNull(message = "Field order is required")
    private Integer fieldOrder;

    @NotBlank(message = "Field key is required")
    private String fieldKey;

    @NotBlank(message = "Label is required")
    private String label;

    @NotNull(message = "Input type is required")
    private String inputType;

    private BigDecimal minValue;

    private BigDecimal maxValue;

    private BigDecimal targetValue;

    private BigDecimal tolerance;

    private String unit;

    private Integer decimalPlaces;

    private List<Object> options;

    private Boolean required;

    private String failCondition;

    private String helpText;

    private String placeholder;

    private String width;
}
