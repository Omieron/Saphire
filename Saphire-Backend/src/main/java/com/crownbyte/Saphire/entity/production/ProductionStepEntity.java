package com.crownbyte.Saphire.entity.production;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.master.MachineEntity;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.production.enums.ProductionStepStatusEnum;
import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import com.crownbyte.Saphire.entity.route.ProductRouteStepEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "production_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionStepEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_instance_id", nullable = false)
    private ProductInstanceEntity productInstance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_step_id", nullable = false)
    private ProductRouteStepEntity routeStep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private MachineEntity machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    private UserEntity operator;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ProductionStepStatusEnum status = ProductionStepStatusEnum.PENDING;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    @Column(name = "retry_count")
    @Builder.Default
    private Integer retryCount = 0;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "corrective_action")
    private String correctiveAction;

    private String notes;

    @OneToMany(mappedBy = "productionStep")
    @Builder.Default
    private List<QcFormRecordEntity> formRecords = new ArrayList<>();
}
