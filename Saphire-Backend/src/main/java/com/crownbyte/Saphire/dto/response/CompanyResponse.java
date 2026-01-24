package com.crownbyte.Saphire.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponse {
    private Long id;
    private String name;
    private String code;
    private Boolean active;
    private String logo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
