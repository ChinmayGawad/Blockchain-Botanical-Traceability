package com.florachain.backend.entity;

import com.florachain.backend.enums.UserRole;
import com.florachain.backend.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_role", columnList = "role"),
    @Index(name = "idx_user_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @Column(name = "id", length = 64, nullable = false, updatable = false)
    private String id; // e.g. "USR-FRM-01"

    @Column(name = "name", nullable = false, length = 128)
    private String name;

    @Column(name = "email", nullable = false, unique = true, length = 128)
    private String email;

    @Column(name = "password", nullable = false, length = 256)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private UserRole role;

    @Column(name = "organization", length = 150)
    private String organization;

    @Column(name = "location", length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private UserStatus status;

    @Column(name = "joined_date", nullable = false)
    private LocalDate joinedDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_certifications", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "certification")
    @Builder.Default
    private List<String> certifications = new ArrayList<>();

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "wallet_address", length = 64)
    private String walletAddress;
}
