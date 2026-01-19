package com.crownbyte.Saphire.entity.master;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.production.ProductInstanceEntity;
import com.crownbyte.Saphire.entity.qc.QcFormTemplateEntity;
import com.crownbyte.Saphire.entity.route.ProductRouteEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false, length = 100)
    private String code;

    private String description;

    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ProductRouteEntity> routes = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    @Builder.Default
    private List<ProductInstanceEntity> instances = new ArrayList<>();

    @OneToMany(mappedBy = "product")
    @Builder.Default
    private List<QcFormTemplateEntity> formTemplates = new ArrayList<>();
}
