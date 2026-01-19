package com.crownbyte.Saphire.entity.qc;

import com.crownbyte.Saphire.entity.qc.enums.InputTypeEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "qc_form_fields")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormFieldEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private QcFormSectionEntity section;

    @Column(name = "field_order", nullable = false)
    private Integer fieldOrder;

    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_type", nullable = false)
    private InputTypeEnum inputType;

    @Column(name = "min_value", precision = 15, scale = 4)
    private BigDecimal minValue;

    @Column(name = "max_value", precision = 15, scale = 4)
    private BigDecimal maxValue;

    @Column(name = "target_value", precision = 15, scale = 4)
    private BigDecimal targetValue;

    @Column(precision = 15, scale = 4)
    private BigDecimal tolerance;

    @Column(length = 50)
    private String unit;

    @Column(name = "decimal_places")
    @Builder.Default
    private Integer decimalPlaces = 2;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<Object> options;

    @Builder.Default
    private Boolean required = true;

    @Column(name = "fail_condition")
    private String failCondition;

    @Column(name = "help_text")
    private String helpText;

    private String placeholder;

    @Column(length = 20)
    @Builder.Default
    private String width = "full";
}
