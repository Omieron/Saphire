package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.master.LocationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<LocationEntity, Long> {
    List<LocationEntity> findByCompanyId(Long companyId);

    List<LocationEntity> findByCompanyIdAndActiveTrue(Long companyId);

    Optional<LocationEntity> findByCompanyIdAndCode(Long companyId, String code);

    boolean existsByCompanyIdAndCode(Long companyId, String code);

    List<LocationEntity> findByNameContainingIgnoreCaseOrCodeContainingIgnoreCase(String name, String code);
}
