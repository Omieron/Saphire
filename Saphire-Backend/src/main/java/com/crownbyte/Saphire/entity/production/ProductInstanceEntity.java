package com.crownbyte.Saphire.entity.production;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.master.LocationEntity;
import com.crownbyte.Saphire.entity.master.ProductEntity;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.production.enums.InstanceStatusEnum;
import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import com.crownbyte.Saphire.entity.route.ProductRouteEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_instances")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductInstanceEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private ProductRouteEntity route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private LocationEntity location;

    @Column(name = "serial_number", unique = true)
    private String serialNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private InstanceStatusEnum status = InstanceStatusEnum.PENDING;

    @Builder.Default
    private Integer priority = 3;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private UserEntity createdBy;

    private String notes;

    @OneToMany(mappedBy = "productInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductionStepEntity> productionSteps = new ArrayList<>();

    @OneToMany(mappedBy = "productInstance")
    @Builder.Default
    private List<QcFormRecordEntity> formRecords = new ArrayList<>();
}
