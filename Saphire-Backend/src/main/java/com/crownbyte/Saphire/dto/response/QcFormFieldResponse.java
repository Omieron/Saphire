package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormFieldResponse {
    private Long id;
    private Long sectionId;
    private Integer fieldOrder;
    private String fieldKey;
    private String label;
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
