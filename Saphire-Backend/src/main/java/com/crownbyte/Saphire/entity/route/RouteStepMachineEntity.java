package com.crownbyte.Saphire.entity.route;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.master.MachineEntity;
import com.crownbyte.Saphire.entity.qc.QcFormTemplateEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "route_step_machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteStepMachineEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_step_id", nullable = false)
    private ProductRouteStepEntity routeStep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", nullable = false)
    private MachineEntity machine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "qc_template_id")
    private QcFormTemplateEntity qcTemplate;

    @Column(name = "preference_order")
    @Builder.Default
    private Integer preferenceOrder = 1;

    private String notes;
}
