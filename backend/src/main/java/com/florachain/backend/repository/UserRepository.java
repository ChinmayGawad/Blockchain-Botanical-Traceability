package com.florachain.backend.repository;

import com.florachain.backend.entity.UserEntity;
import com.florachain.backend.enums.UserRole;
import com.florachain.backend.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
    Optional<UserEntity> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<UserEntity> findByRole(UserRole role);
    List<UserEntity> findByStatus(UserStatus status);
}
