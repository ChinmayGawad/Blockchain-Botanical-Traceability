package com.florachain.backend.service;

import com.florachain.backend.dto.AuthDTOs.AuthResponse;
import com.florachain.backend.dto.AuthDTOs.LoginRequest;
import com.florachain.backend.dto.AuthDTOs.RegisterRequest;
import com.florachain.backend.dto.AuthDTOs.UserDto;
import com.florachain.backend.entity.UserEntity;
import com.florachain.backend.enums.UserRole;
import com.florachain.backend.enums.UserStatus;
import com.florachain.backend.exception.BadRequestException;
import com.florachain.backend.exception.ResourceNotFoundException;
import com.florachain.backend.repository.UserRepository;
import com.florachain.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserEntity user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new BadRequestException("Email is required for registration");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail().trim())) {
            throw new BadRequestException("Email address is already in use: " + request.getEmail());
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.FARMER;
        String rolePrefix = role.name().substring(0, Math.min(3, role.name().length()));
        String generatedId = "USR-" + rolePrefix + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        String rawAadhaar = request.getAadhaarNumber();
        String aadhaarHash = null;
        String aadhaarMasked = null;

        if (rawAadhaar != null && !rawAadhaar.trim().isEmpty()) {
            String trimmedAadhaar = rawAadhaar.trim();
            if (!validateVerhoeff(trimmedAadhaar)) {
                throw new BadRequestException("Invalid Aadhaar number checksum");
            }
            aadhaarHash = hashAadhaar(trimmedAadhaar);
            if (userRepository.existsByAadhaarHash(aadhaarHash)) {
                throw new BadRequestException("An account is already linked to this Aadhaar number");
            }
            aadhaarMasked = "XXXX-XXXX-" + trimmedAadhaar.substring(trimmedAadhaar.length() - 4);
        }

        UserEntity user = UserEntity.builder()
                .id(generatedId)
                .name(request.getName() != null ? request.getName().trim() : "FloraChain User")
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .organization(request.getOrganization() != null ? request.getOrganization() : role.name() + " Hub")
                .location(request.getLocation() != null ? request.getLocation() : "Verified Node")
                .status(UserStatus.ACTIVE)
                .joinedDate(LocalDate.now())
                .certifications(request.getCertifications() != null ? request.getCertifications() : List.of())
                .avatarUrl(request.getAvatarUrl() != null ? request.getAvatarUrl() : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                .aadhaarHash(aadhaarHash)
                .aadhaarMasked(aadhaarMasked)
                .build();

        UserEntity savedUser = userRepository.save(Objects.requireNonNull(user));

        String jwt = tokenProvider.generateTokenFromUser(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getName(),
                savedUser.getRole().name(),
                savedUser.getOrganization()
        );

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(mapToUserDto(savedUser))
                .build();
    }

    @Transactional
    public AuthResponse switchRole(UserRole targetRole) {
        List<UserEntity> roleUsers = userRepository.findByRole(targetRole);
        UserEntity user;

        if (!roleUsers.isEmpty()) {
            user = roleUsers.get(0);
        } else {
            // Create default user for this role if none exists
            String rolePrefix = targetRole.name().substring(0, Math.min(3, targetRole.name().length()));
            String generatedId = "USR-" + rolePrefix + "-01";
            user = UserEntity.builder()
                    .id(generatedId)
                    .name(targetRole.name().charAt(0) + targetRole.name().substring(1).toLowerCase() + " Operator")
                    .email(targetRole.name().toLowerCase() + "@florachain.org")
                    .password(passwordEncoder.encode("password123"))
                    .role(targetRole)
                    .organization(targetRole.name() + " Consortium Hub")
                    .location("Verified Hub Location")
                    .status(UserStatus.ACTIVE)
                    .joinedDate(LocalDate.now())
                    .certifications(List.of())
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150")
                    .build();
            user = userRepository.save(user);
        }

        String jwt = tokenProvider.generateTokenFromUser(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getOrganization()
        );

        return AuthResponse.builder()
                .token(jwt)
                .tokenType("Bearer")
                .user(mapToUserDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToUserDto(user);
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDto approveUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setStatus(UserStatus.ACTIVE);
        return mapToUserDto(userRepository.save(Objects.requireNonNull(user)));
    }

    @Transactional
    public UserDto rejectUser(String userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setStatus(UserStatus.REJECTED);
        return mapToUserDto(userRepository.save(Objects.requireNonNull(user)));
    }

    @Nullable
    public UserDto mapToUserDto(@Nullable UserEntity user) {
        if (user == null) {
            return null;
        }
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .organization(user.getOrganization())
                .location(user.getLocation())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .joinedDate(user.getJoinedDate() != null ? user.getJoinedDate().toString() : "")
                .certifications(user.getCertifications() != null ? user.getCertifications() : List.of())
                .avatarUrl(user.getAvatarUrl())
                .walletAddress(user.getWalletAddress())
                .aadhaarNumber(user.getAadhaarMasked())
                .build();
    }

    // Multiplication table for Verhoeff algorithm
    private static final int[][] VERHOEFF_D = {
        {0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
        {1, 2, 3, 4, 0, 6, 7, 8, 9, 5},
        {2, 3, 4, 0, 1, 7, 8, 9, 5, 6},
        {3, 4, 0, 1, 2, 8, 9, 5, 6, 7},
        {4, 0, 1, 2, 3, 9, 5, 6, 7, 8},
        {5, 9, 8, 7, 6, 0, 4, 3, 2, 1},
        {6, 5, 9, 8, 7, 1, 0, 4, 3, 2},
        {7, 6, 5, 9, 8, 2, 1, 0, 4, 3},
        {8, 7, 6, 5, 9, 3, 2, 1, 0, 4},
        {9, 8, 7, 6, 5, 4, 3, 2, 1, 0}
    };

    // Permutation table for Verhoeff algorithm
    private static final int[][] VERHOEFF_P = {
        {0, 1, 2, 3, 4, 5, 6, 7, 8, 9},
        {1, 5, 7, 6, 2, 8, 3, 0, 9, 4},
        {5, 8, 0, 3, 7, 9, 6, 1, 4, 2},
        {8, 9, 1, 6, 0, 4, 3, 5, 2, 7},
        {9, 4, 5, 3, 1, 2, 6, 8, 7, 0},
        {4, 2, 8, 6, 5, 7, 3, 9, 0, 1},
        {2, 7, 9, 3, 8, 0, 6, 4, 1, 5},
        {7, 0, 4, 6, 9, 1, 3, 2, 5, 8}
    };

    public static boolean validateVerhoeff(String num) {
        if (num == null || num.length() != 12 || !num.matches("\\d{12}")) {
            return false;
        }
        int c = 0;
        int[] myArray = new int[num.length()];
        for (int i = 0; i < num.length(); i++) {
            myArray[i] = Character.getNumericValue(num.charAt(i));
        }
        for (int i = 0; i < myArray.length; i++) {
            c = VERHOEFF_D[c][VERHOEFF_P[(i % 8)][myArray[myArray.length - i - 1]]];
        }
        return c == 0;
    }

    private static String hashAadhaar(String aadhaar) {
        try {
            java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(("florachain_aadhaar_salt:" + aadhaar).getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
