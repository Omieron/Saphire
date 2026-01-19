package com.crownbyte.Saphire.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormSectionRequest {

    @NotNull(message = "Section order is required")
    private Integer sectionOrder;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private Boolean isRepeatable;

    private Integer repeatCount;

    private String repeatLabelPattern;

    private Boolean hasGroups;

    private List<String> groupLabels;

    private List<QcFormFieldRequest> fields;
}
