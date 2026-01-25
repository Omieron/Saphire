package com.crownbyte.Saphire.service;

import com.crownbyte.Saphire.dto.request.UserRequest;
import com.crownbyte.Saphire.dto.response.UserResponse;
import com.crownbyte.Saphire.entity.master.MachineEntity;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.master.enums.UserRoleEnum;
import com.crownbyte.Saphire.repository.MachineRepository;
import com.crownbyte.Saphire.repository.UserRepository;
import com.crownbyte.Saphire.service.impl.UserServiceImpl;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService implements UserServiceImpl {

    private final UserRepository userRepository;
    private final MachineRepository machineRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll(String search) {
        List<UserEntity> users;
        if (search != null && !search.trim().isEmpty()) {
            users = userRepository.findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(search, search);
        } else {
            users = userRepository.findAll();
        }
        return users.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getActive() {
        return userRepository.findByActiveTrue()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getByRole(String role) {
        UserRoleEnum roleEnum = UserRoleEnum.valueOf(role.toUpperCase());
        return userRepository.findByRole(roleEnum)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> getById(Long id) {
        return userRepository.findById(id)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserResponse> getByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(this::toResponse);
    }

    @Override
    public UserResponse create(UserRequest request) {
        UserRoleEnum role = UserRoleEnum.valueOf(request.getRole().toUpperCase());

        UserEntity entity = UserEntity.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .hashedPassword(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(role)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        if (request.getMachineIds() != null && !request.getMachineIds().isEmpty()) {
            List<MachineEntity> machines = machineRepository.findAllById(request.getMachineIds());
            if (machines.size() != request.getMachineIds().size()) {
                throw new EntityNotFoundException("Some machines were not found");
            }
            entity.getMachines().addAll(machines);
        }

        UserEntity saved = userRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public UserResponse update(Long id, UserRequest request) {
        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));

        entity.setUsername(request.getUsername());
        entity.setEmail(request.getEmail());
        entity.setFullName(request.getFullName());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            entity.setHashedPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRole() != null) {
            entity.setRole(UserRoleEnum.valueOf(request.getRole().toUpperCase()));
        }

        if (request.getActive() != null) {
            entity.setActive(request.getActive());
        }

        if (request.getMachineIds() != null) {
            List<MachineEntity> machines = machineRepository.findAllById(request.getMachineIds());
            if (machines.size() != request.getMachineIds().size()) {
                throw new EntityNotFoundException("Some machines were not found");
            }
            entity.getMachines().clear();
            entity.getMachines().addAll(machines);
        }

        UserEntity saved = userRepository.save(entity);
        return toResponse(saved);
    }

    @Override
    public void delete(Long id) {
        UserEntity entity = userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + id));
        entity.setActive(false);
        userRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private UserResponse toResponse(UserEntity entity) {
        return UserResponse.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .email(entity.getEmail())
                .fullName(entity.getFullName())
                .role(entity.getRole().name())
                .active(entity.getActive())
                .machineIds(entity.getMachines().stream().map(MachineEntity::getId).collect(Collectors.toList()))
                .machineNames(entity.getMachines().stream().map(MachineEntity::getName).collect(Collectors.joining(", ")))
                .build();
    }
}
