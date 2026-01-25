package com.crownbyte.Saphire.entity.master;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.master.enums.UserRoleEnum;
import com.crownbyte.Saphire.entity.master.MachineEntity;
import com.crownbyte.Saphire.entity.production.ProductionStepEntity;
import com.crownbyte.Saphire.entity.qc.QcFormRecordEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "hashed_password")
    private String hashedPassword;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRoleEnum role;

    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "operator")
    @Builder.Default
    private List<ProductionStepEntity> productionSteps = new ArrayList<>();

    @OneToMany(mappedBy = "filledBy")
    @Builder.Default
    private List<QcFormRecordEntity> filledRecords = new ArrayList<>();

    @OneToMany(mappedBy = "approvedBy")
    @Builder.Default
    private List<QcFormRecordEntity> approvedRecords = new ArrayList<>();

    @ManyToMany
    @JoinTable(
        name = "user_machines",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "machine_id")
    )
    @Builder.Default
    private Set<MachineEntity> machines = new HashSet<>();
}
