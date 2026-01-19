package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormSectionResponse {
    private Long id;
    private Long templateId;
    private Integer sectionOrder;
    private String name;
    private String description;
    private Boolean isRepeatable;
    private Integer repeatCount;
    private String repeatLabelPattern;
    private Boolean hasGroups;
    private List<String> groupLabels;
    private List<QcFormFieldResponse> fields;
}
