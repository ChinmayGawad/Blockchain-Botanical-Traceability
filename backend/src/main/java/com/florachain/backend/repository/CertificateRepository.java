package com.florachain.backend.repository;

import com.florachain.backend.entity.CertificateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends JpaRepository<CertificateEntity, String> {
    List<CertificateEntity> findByProductId(String productId);
    Optional<CertificateEntity> findByIpfsCid(String ipfsCid);
}
