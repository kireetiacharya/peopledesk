package com.example.ems.controller;

import com.example.ems.dto.EmployeeRequest;
import com.example.ems.dto.EmployeeResponse;
import com.example.ems.dto.ProfileRequest;
import com.example.ems.dto.StatusRequest;
import com.example.ems.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<EmployeeResponse> list(@RequestParam(defaultValue = "") String search) {
        return employeeService.list(search);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse create(@Valid @RequestBody EmployeeRequest request) {
        return employeeService.create(request);
    }

    @GetMapping("/me")
    public EmployeeResponse profile(Authentication authentication) {
        return employeeService.getProfile(authentication.getName());
    }

    @PutMapping("/me")
    public EmployeeResponse updateProfile(
            Authentication authentication, @Valid @RequestBody ProfileRequest request) {
        return employeeService.updateProfile(authentication.getName(), request);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse get(@PathVariable Long id) {
        return employeeService.get(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public EmployeeResponse update(@PathVariable Long id, @Valid @RequestBody EmployeeRequest request) {
        return employeeService.update(id, request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> setStatus(@PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        employeeService.setActive(id, request.active());
        return Map.of("message", request.active() ? "Employee activated." : "Employee deactivated.");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, String> delete(@PathVariable Long id) {
        employeeService.delete(id);
        return Map.of("message", "Employee deleted.");
    }
}
