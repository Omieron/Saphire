package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Boolean active;
    private List<Long> machineIds;
    private String machineNames;
}
