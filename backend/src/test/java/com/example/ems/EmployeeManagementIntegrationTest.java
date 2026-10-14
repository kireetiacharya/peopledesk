package com.example.ems;

import com.example.ems.dto.AuthResponse;
import com.example.ems.dto.EmployeeResponse;
import com.example.ems.dto.LoginRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class EmployeeManagementIntegrationTest {
    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void seedsAdminAndAllowsLogin() {
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login",
                new LoginRequest("admin@company.com", "Admin@123"),
                AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().token()).isNotBlank();
        assertThat(response.getBody().employee().role().name()).isEqualTo("ADMIN");
    }

    @Test
    void adminCanCreateAndSearchEmployees() {
        AuthResponse login = restTemplate.postForObject(
                "/api/auth/login",
                new LoginRequest("admin@company.com", "Admin@123"),
                AuthResponse.class);
        assertThat(login).isNotNull();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(login.token());
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, Object> request = Map.of(
                "name", "Ada Lovelace",
                "email", "ada@example.com",
                "phone", "555-0100",
                "password", "Temporary123");
        ResponseEntity<EmployeeResponse> created = restTemplate.postForEntity(
                "/api/employees", new HttpEntity<>(request, headers), EmployeeResponse.class);

        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(created.getBody()).isNotNull();
        assertThat(created.getBody().role().name()).isEqualTo("EMPLOYEE");

        ResponseEntity<EmployeeResponse[]> results = restTemplate.exchange(
                "/api/employees?search=Ada", HttpMethod.GET, new HttpEntity<>(headers), EmployeeResponse[].class);
        assertThat(results.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(results.getBody()).hasSize(1);
        assertThat(results.getBody()[0].email()).isEqualTo("ada@example.com");

        AuthResponse employeeLogin = restTemplate.postForObject(
                "/api/auth/login",
                new LoginRequest("ada@example.com", "Temporary123"),
                AuthResponse.class);
        assertThat(employeeLogin).isNotNull();
        HttpHeaders employeeHeaders = new HttpHeaders();
        employeeHeaders.setBearerAuth(employeeLogin.token());

        ResponseEntity<EmployeeResponse> profile = restTemplate.exchange(
                "/api/employees/me", HttpMethod.GET, new HttpEntity<>(employeeHeaders), EmployeeResponse.class);
        assertThat(profile.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(profile.getBody()).isNotNull();
        assertThat(profile.getBody().name()).isEqualTo("Ada Lovelace");

        ResponseEntity<String> forbidden = restTemplate.exchange(
                "/api/employees", HttpMethod.GET, new HttpEntity<>(employeeHeaders), String.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        Map<String, Object> profileUpdate = Map.of(
                "name", "Ada Lovelace",
                "email", "ada.lovelace@example.com",
                "phone", "555-0100",
                "address", "London");
        ResponseEntity<EmployeeResponse> updatedProfile = restTemplate.exchange(
                "/api/employees/me", HttpMethod.PUT,
                new HttpEntity<>(profileUpdate, employeeHeaders), EmployeeResponse.class);
        assertThat(updatedProfile.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updatedProfile.getBody()).isNotNull();
        assertThat(updatedProfile.getBody().email()).isEqualTo("ada.lovelace@example.com");

        ResponseEntity<Map> passwordChange = restTemplate.exchange(
                "/api/auth/password", HttpMethod.PUT,
                new HttpEntity<>(Map.of(
                        "currentPassword", "Temporary123",
                        "newPassword", "NewPassword456"), employeeHeaders),
                Map.class);
        assertThat(passwordChange.getStatusCode()).isEqualTo(HttpStatus.OK);

        ResponseEntity<AuthResponse> newLogin = restTemplate.postForEntity(
                "/api/auth/login",
                new LoginRequest("ada.lovelace@example.com", "NewPassword456"),
                AuthResponse.class);
        assertThat(newLogin.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
