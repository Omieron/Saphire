package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormValueResponse {
    private Long id;
    private Long recordId;
    private Long fieldId;
    private String fieldKey;
    private String fieldLabel;
    private String inputType;
    private Integer repeatIndex;
    private String groupKey;
    private String valueText;
    private BigDecimal valueNumber;
    private Boolean valueBoolean;
    private Object valueJson;
    private String result;
    private Boolean autoEvaluated;
    private LocalDateTime enteredAt;
}
