package com.crownbyte.Saphire.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormTemplateRequest {

    private Long companyId;

    @NotBlank(message = "Code is required")
    private String code;

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Context type is required")
    private String contextType;

    private List<Long> machineIds;

    private Long productId;

    private String scheduleType;

    private Map<String, Object> scheduleConfig;

    private Boolean requiresApproval;

    private Boolean allowPartialSave;

    private Boolean active;

    @Valid
    private List<QcFormHeaderFieldRequest> headerFields;

    @Valid
    private List<QcFormSectionRequest> sections;
}
