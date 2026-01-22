package com.crownbyte.Saphire.dto.response;

import com.crownbyte.Saphire.entity.qc.enums.TaskAssignmentTypeEnum;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignmentResponse {
    private Long id;
    
    @JsonProperty("templateId")
    private Long templateId;
    
    private String templateName;
    private String templateCode;
    private TaskAssignmentTypeEnum type;
    
    @JsonProperty("machineId")
    private Long machineId;
    
    @JsonProperty("machineName")
    private String machineName;
    
    @JsonProperty("productId")
    private Long productId;
    
    @JsonProperty("productName")
    private String productName;
    
    private List<UserResponse> assignedUsers;
    private List<TaskScheduleResponse> schedules;
    private Boolean active;
}
