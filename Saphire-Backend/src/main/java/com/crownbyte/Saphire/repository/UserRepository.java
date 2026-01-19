package com.crownbyte.Saphire.repository;

import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.master.enums.UserRoleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<UserEntity> findByRole(UserRoleEnum role);

    List<UserEntity> findByActiveTrue();
}
