package com.crownbyte.Saphire.entity.master;

import com.crownbyte.Saphire.entity.master.enums.MachineStatusEnum;
import com.crownbyte.Saphire.entity.production.ProductInstanceEntity;
import com.crownbyte.Saphire.entity.production.ProductionStepEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "machine_status")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MachineStatusEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "machine_id", unique = true, nullable = false)
    private MachineEntity machine;

    @Enumerated(EnumType.STRING)
    @Column(name = "current_status", nullable = false)
    @Builder.Default
    private MachineStatusEnum currentStatus = MachineStatusEnum.IDLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_instance_id")
    private ProductInstanceEntity currentInstance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_step_id")
    private ProductionStepEntity currentStep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_operator_id")
    private UserEntity currentOperator;

    @Column(name = "status_since", nullable = false)
    private LocalDateTime statusSince;

    @Column(name = "estimated_finish_at")
    private LocalDateTime estimatedFinishAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
