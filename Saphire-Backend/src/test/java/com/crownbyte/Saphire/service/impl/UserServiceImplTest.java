package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.UserRequest;
import com.crownbyte.Saphire.dto.response.UserResponse;
import com.crownbyte.Saphire.entity.master.UserEntity;
import com.crownbyte.Saphire.entity.master.enums.UserRoleEnum;
import com.crownbyte.Saphire.repository.MachineRepository;
import com.crownbyte.Saphire.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private MachineRepository machineRepository;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private UserEntity userEntity;

    @BeforeEach
    void setUp() {
        userEntity = UserEntity.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .fullName("Test User")
                .role(UserRoleEnum.OPERATOR)
                .active(true)
                .build();
    }

    @Test
    void getAll_ShouldReturnListOfUsers() {
        when(userRepository.findAll()).thenReturn(Collections.singletonList(userEntity));

        List<UserResponse> result = userService.getAll(null);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("testuser", result.get(0).getUsername());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void create_ShouldSaveUser() {
        UserRequest request = new UserRequest();
        request.setUsername("newuser");
        request.setPassword("password");
        request.setEmail("new@example.com");
        request.setFullName("New User");
        request.setRole("OPERATOR");

        when(passwordEncoder.encode("password")).thenReturn("hashed");
        when(userRepository.save(any())).thenReturn(userEntity);

        UserResponse result = userService.create(request);

        assertNotNull(result);
        verify(userRepository, times(1)).save(any());
        verify(passwordEncoder, times(1)).encode("password");
    }

    @Test
    void delete_ShouldDeactivateUser() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(userEntity));

        userService.delete(1L);

        assertFalse(userEntity.getActive());
        verify(userRepository, times(1)).save(userEntity);
    }
}
