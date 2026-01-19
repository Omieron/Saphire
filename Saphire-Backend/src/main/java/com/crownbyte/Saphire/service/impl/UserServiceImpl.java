package com.crownbyte.Saphire.service.impl;

import com.crownbyte.Saphire.dto.request.UserRequest;
import com.crownbyte.Saphire.dto.response.UserResponse;
import java.util.List;
import java.util.Optional;

public interface UserServiceImpl {

    List<UserResponse> getAll();

    List<UserResponse> getActive();

    List<UserResponse> getByRole(String role);

    Optional<UserResponse> getById(Long id);

    Optional<UserResponse> getByUsername(String username);

    UserResponse create(UserRequest request);

    UserResponse update(Long id, UserRequest request);

    void delete(Long id);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
