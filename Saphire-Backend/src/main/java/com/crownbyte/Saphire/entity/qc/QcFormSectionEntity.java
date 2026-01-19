package com.crownbyte.Saphire.entity.qc;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "qc_form_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormSectionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private QcFormTemplateEntity template;

    @Column(name = "section_order", nullable = false)
    private Integer sectionOrder;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "is_repeatable")
    @Builder.Default
    private Boolean isRepeatable = false;

    @Column(name = "repeat_count")
    private Integer repeatCount;

    @Column(name = "repeat_label_pattern")
    private String repeatLabelPattern;

    @Column(name = "has_groups")
    @Builder.Default
    private Boolean hasGroups = false;

    @Type(JsonType.class)
    @Column(name = "group_labels", columnDefinition = "jsonb")
    private List<String> groupLabels;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fieldOrder ASC")
    @Builder.Default
    private List<QcFormFieldEntity> fields = new ArrayList<>();
}
