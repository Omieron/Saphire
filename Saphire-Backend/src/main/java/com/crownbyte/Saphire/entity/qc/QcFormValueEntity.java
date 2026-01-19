package com.crownbyte.Saphire.entity.qc;

import com.crownbyte.Saphire.entity.qc.enums.ValueResultEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "qc_form_values")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormValueEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private QcFormRecordEntity record;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id", nullable = false)
    private QcFormFieldEntity field;

    @Column(name = "repeat_index")
    @Builder.Default
    private Integer repeatIndex = 0;

    @Column(name = "group_key", length = 50)
    private String groupKey;

    @Column(name = "value_text")
    private String valueText;

    @Column(name = "value_number", precision = 15, scale = 4)
    private BigDecimal valueNumber;

    @Column(name = "value_boolean")
    private Boolean valueBoolean;

    @Type(JsonType.class)
    @Column(name = "value_json", columnDefinition = "jsonb")
    private Object valueJson;

    @Enumerated(EnumType.STRING)
    private ValueResultEnum result;

    @Column(name = "auto_evaluated")
    @Builder.Default
    private Boolean autoEvaluated = true;

    @Column(name = "entered_at")
    @Builder.Default
    private LocalDateTime enteredAt = LocalDateTime.now();
}
