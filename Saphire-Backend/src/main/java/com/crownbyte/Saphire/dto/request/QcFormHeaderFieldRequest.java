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
public class QcFormHeaderFieldRequest {

    @NotNull(message = "Field order is required")
    private Integer fieldOrder;

    @NotBlank(message = "Field key is required")
    private String fieldKey;

    @NotBlank(message = "Label is required")
    private String label;

    @NotNull(message = "Field type is required")
    private String fieldType;

    private List<String> options;

    private Boolean required;

    private String defaultValue;
}
