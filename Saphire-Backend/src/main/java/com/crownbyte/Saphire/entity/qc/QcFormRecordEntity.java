package com.crownbyte.Saphire.entity.qc;

import com.crownbyte.Saphire.entity.master.MachineEntity;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.production.ProductInstanceEntity;
import com.crownbyte.Saphire.entity.production.ProductionStepEntity;
import com.crownbyte.Saphire.entity.qc.enums.OverallResultEnum;
import com.crownbyte.Saphire.entity.qc.enums.RecordStatusEnum;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "qc_form_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QcFormRecordEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private QcFormTemplateEntity template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id")
    private MachineEntity machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_instance_id")
    private ProductInstanceEntity productInstance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "production_step_id")
    private ProductionStepEntity productionStep;

    @Type(JsonType.class)
    @Column(name = "header_data", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> headerData;

    @Column(name = "scheduled_for")
    private LocalDateTime scheduledFor;

    @Column(name = "period_start")
    private LocalDateTime periodStart;

    @Column(name = "period_end")
    private LocalDateTime periodEnd;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RecordStatusEnum status = RecordStatusEnum.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_result")
    private OverallResultEnum overallResult;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "filled_by")
    private UserEntity filledBy;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private UserEntity approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    private String notes;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "record", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<QcFormValueEntity> values = new ArrayList<>();
}
