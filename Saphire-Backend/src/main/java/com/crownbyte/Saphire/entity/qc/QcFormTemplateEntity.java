package com.crownbyte.Saphire.entity.qc;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.master.CompanyEntity;
import com.crownbyte.Saphire.entity.master.MachineEntity;
import com.crownbyte.Saphire.entity.master.ProductEntity;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.qc.enums.ContextTypeEnum;
import com.crownbyte.Saphire.entity.qc.enums.ScheduleTypeEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "qc_form_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormTemplateEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private CompanyEntity company;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "context_type", nullable = false)
    private ContextTypeEnum contextType;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "qc_template_machines",
        joinColumns = @JoinColumn(name = "qc_template_id"),
        inverseJoinColumns = @JoinColumn(name = "machine_id")
    )
    @Builder.Default
    private java.util.Set<MachineEntity> machines = new java.util.HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_type")
    @Builder.Default
    private ScheduleTypeEnum scheduleType = ScheduleTypeEnum.ON_DEMAND;

    @Type(JsonType.class)
    @Column(name = "schedule_config", columnDefinition = "jsonb")
    private Map<String, Object> scheduleConfig;

    @Column(name = "requires_approval")
    @Builder.Default
    private Boolean requiresApproval = false;

    @Column(name = "allow_partial_save")
    @Builder.Default
    private Boolean allowPartialSave = true;

    @Builder.Default
    private Integer version = 1;

    @Builder.Default
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fieldOrder ASC")
    @Builder.Default
    private List<QcFormHeaderFieldEntity> headerFields = new ArrayList<>();

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sectionOrder ASC")
    @Builder.Default
    private List<QcFormSectionEntity> sections = new ArrayList<>();

    @OneToMany(mappedBy = "template")
    @Builder.Default
    private List<QcFormRecordEntity> records = new ArrayList<>();
}
