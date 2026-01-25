package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormTemplateResponse {
    private Long id;
    private Long companyId;
    private String companyName;
    private String code;
    private String name;
    private String description;
    private String contextType;
    private List<Long> machineIds;
    private String machineNames;
    private String machineCodes;
    private Long productId;
    private String productName;
    private String scheduleType;
    private Map<String, Object> scheduleConfig;
    private Boolean requiresApproval;
    private Boolean allowPartialSave;
    private Integer version;
    private Boolean active;
    private Long createdById;
    private String createdByName;
    private List<QcFormHeaderFieldResponse> headerFields;
    private List<QcFormSectionResponse> sections;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
