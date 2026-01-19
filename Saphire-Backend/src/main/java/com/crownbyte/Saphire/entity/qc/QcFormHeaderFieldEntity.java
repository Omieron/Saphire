package com.crownbyte.Saphire.entity.qc;

import com.crownbyte.Saphire.entity.qc.enums.HeaderFieldTypeEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.util.List;

@Entity
@Table(name = "qc_form_header_fields")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormHeaderFieldEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private QcFormTemplateEntity template;

    @Column(name = "field_order", nullable = false)
    private Integer fieldOrder;

    @Column(name = "field_key", nullable = false, length = 100)
    private String fieldKey;

    @Column(nullable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "field_type", nullable = false)
    private HeaderFieldTypeEnum fieldType;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> options;

    @Builder.Default
    private Boolean required = true;

    @Column(name = "default_value")
    private String defaultValue;
}
