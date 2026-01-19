package com.crownbyte.Saphire.entity.master;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.production.ProductInstanceEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "locations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LocationEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 50)
    private String code;

    private String address;

    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    @Builder.Default
    private List<MachineEntity> machines = new ArrayList<>();

    @OneToMany(mappedBy = "location")
    @Builder.Default
    private List<ProductInstanceEntity> productInstances = new ArrayList<>();
}
