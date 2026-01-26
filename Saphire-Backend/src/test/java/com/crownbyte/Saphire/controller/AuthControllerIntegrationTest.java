package com.crownbyte.Saphire.controller;

import com.crownbyte.Saphire.dto.request.LoginRequest;
import com.crownbyte.Saphire.dto.response.UserResponse;
import com.crownbyte.Saphire.security.JwtAuthenticationFilter;
import com.crownbyte.Saphire.security.JwtService;
import com.crownbyte.Saphire.service.SystemErrorLogService;
import com.crownbyte.Saphire.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerIntegrationTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private AuthenticationManager authenticationManager;

        @MockitoBean
        private JwtService jwtService;

        @MockitoBean
        private UserService userService;

        @MockitoBean
        private SystemErrorLogService errorLogService;

        @MockitoBean
        private JwtAuthenticationFilter jwtAuthFilter;

        @MockitoBean
        private UserDetailsService userDetailsService;

        @Test
        void login_ShouldReturnToken() throws Exception {
                LoginRequest request = new LoginRequest();
                request.setUsername("test");
                request.setPassword("password");

                Authentication authentication = mock(Authentication.class);
                when(authentication.getPrincipal())
                                .thenReturn(mock(org.springframework.security.core.userdetails.UserDetails.class));
                when(authenticationManager.authenticate(any())).thenReturn(authentication);
                when(jwtService.generateToken(any())).thenReturn("mock-token");
                when(userService.getByUsername("test"))
                                .thenReturn(Optional.of(UserResponse.builder().username("test").build()));

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.token").value("mock-token"));
        }
}
