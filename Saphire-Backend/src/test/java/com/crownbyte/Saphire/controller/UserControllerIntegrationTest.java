package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.response.UserResponse;
import com.crownbyte.Saphire.service.UserService;
import com.crownbyte.Saphire.security.JwtAuthenticationFilter;
import com.crownbyte.Saphire.service.SystemErrorLogService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private SystemErrorLogService errorLogService;

    // Need to mock these because they are used in SecurityConfig
    @MockitoBean
    private JwtAuthenticationFilter jwtAuthFilter;
    @MockitoBean
    private UserDetailsService userDetailsService;

    @Test
    void getAll_ShouldReturnListOfUsers() throws Exception {
        UserResponse user = UserResponse.builder()
                .id(1L)
                .username("test")
                .fullName("Test User")
                .build();

        when(userService.getAll(null)).thenReturn(Collections.singletonList(user));

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].username").value("test"));
    }
}
