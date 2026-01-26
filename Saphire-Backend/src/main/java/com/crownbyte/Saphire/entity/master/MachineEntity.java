package com.crownbyte.Saphire.entity.master;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.production.ProductionStepEntity;
import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import com.crownbyte.Saphire.entity.route.RouteStepMachineEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "machines")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private LocationEntity location;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(length = 100)
    private String type;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "maintenance_mode")
    @Builder.Default
    private Boolean maintenanceMode = false;

    @Column(name = "available_from")
    private LocalDateTime availableFrom;

    @OneToOne(mappedBy = "machine", cascade = CascadeType.ALL)
    private MachineStatusEntity status;

    @OneToMany(mappedBy = "machine")
    @Builder.Default
    private List<RouteStepMachineEntity> routeStepMachines = new ArrayList<>();

    @OneToMany(mappedBy = "machine")
    @Builder.Default
    private List<ProductionStepEntity> productionSteps = new ArrayList<>();

    @ManyToMany(mappedBy = "machines")
    @Builder.Default
    private Set<UserEntity> assignedUsers = new HashSet<>();

    @OneToMany(mappedBy = "machine")
    @Builder.Default
    private List<QcFormRecordEntity> formRecords = new ArrayList<>();
}
