package com.example.ems.dto;

import com.example.ems.model.Employee;
import com.example.ems.model.Role;

import java.time.Instant;

public record EmployeeResponse(
        Long id,
        String name,
        String email,
        String phone,
        String address,
        Role role,
        Long departmentId,
        String departmentName,
        boolean active,
        Instant createdAt
) {
    public static EmployeeResponse from(Employee employee) {
        return new EmployeeResponse(
                employee.getId(), employee.getName(), employee.getEmail(),
                employee.getPhone(), employee.getAddress(), employee.getRole(),
                employee.getDepartment() == null ? null : employee.getDepartment().getId(),
                employee.getDepartment() == null ? null : employee.getDepartment().getName(),
                employee.isActive(), employee.getCreatedAt()
        );
    }
}
