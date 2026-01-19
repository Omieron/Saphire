package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormHeaderFieldResponse {
    private Long id;
    private Long templateId;
    private Integer fieldOrder;
    private String fieldKey;
    private String label;
    private String fieldType;
    private List<String> options;
    private Boolean required;
    private String defaultValue;
}
