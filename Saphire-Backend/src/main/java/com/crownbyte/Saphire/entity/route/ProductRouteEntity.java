package com.crownbyte.Saphire.entity.route;

import com.crownbyte.Saphire.entity.base.BaseEntity;
import com.crownbyte.Saphire.entity.master.ProductEntity;
import com.crownbyte.Saphire.entity.production.ProductInstanceEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "product_routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductRouteEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private ProductEntity product;

    @Builder.Default
    private Integer version = 1;

    private String name;

    @Builder.Default
    private Boolean active = true;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    @Builder.Default
    private List<ProductRouteStepEntity> steps = new ArrayList<>();

    @OneToMany(mappedBy = "route")
    @Builder.Default
    private List<ProductInstanceEntity> instances = new ArrayList<>();
}
