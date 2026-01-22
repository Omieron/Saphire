package com.crownbyte.Saphire.dto.request;

import com.crownbyte.Saphire.entity.qc.enums.TaskAssignmentTypeEnum;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignmentRequest {
    @JsonProperty("templateId")
    private Long templateId;
    
    private TaskAssignmentTypeEnum type;
    
    @JsonProperty("machineId")
    private Long machineId;
    
    @JsonProperty("productId")
    private Long productId;
    
    private List<Long> userIds;
    private List<TaskScheduleRequest> schedules;
}
