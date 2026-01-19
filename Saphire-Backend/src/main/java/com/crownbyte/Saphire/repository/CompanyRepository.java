package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.master.CompanyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<CompanyEntity, Long> {
    Optional<CompanyEntity> findByCode(String code);

    boolean existsByCode(String code);
}
