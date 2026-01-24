package com.crownbyte.Saphire.entity.master;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.qc.QcFormTemplateEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false, length = 50)
    private String code;

    @Builder.Default
    private Boolean active = true;

    @Column(columnDefinition = "TEXT")
    private String logo;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL)
    @Builder.Default
    private List<LocationEntity> locations = new ArrayList<>();

    @OneToMany(mappedBy = "company")
    @Builder.Default
    private List<QcFormTemplateEntity> formTemplates = new ArrayList<>();
}
