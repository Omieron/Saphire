package com.crownbyte.Saphire.entity.route;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.production.ProductionStepEntity;
import com.crownbyte.Saphire.entity.route.enums.StepTypeEnum;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_route_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRouteStepEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    private ProductRouteEntity route;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Enumerated(EnumType.STRING)
    @Column(name = "step_type")
    @Builder.Default
    private StepTypeEnum stepType = StepTypeEnum.SERIAL;

    @Column(name = "estimated_setup_minutes")
    @Builder.Default
    private Integer estimatedSetupMinutes = 0;

    @Column(name = "estimated_cycle_minutes")
    @Builder.Default
    private Integer estimatedCycleMinutes = 0;

    @OneToMany(mappedBy = "routeStep", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("preferenceOrder ASC")
    @Builder.Default
    private List<RouteStepMachineEntity> machines = new ArrayList<>();

    @OneToMany(mappedBy = "routeStep")
    @Builder.Default
    private List<ProductionStepEntity> productionSteps = new ArrayList<>();
}
