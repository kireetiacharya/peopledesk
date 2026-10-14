package com.example.ems.dto;

import com.example.ems.model.Department;

import java.time.Instant;

public record DepartmentResponse(Long id, String name, String description, Instant createdAt) {
    public static DepartmentResponse from(Department department) {
        return new DepartmentResponse(department.getId(), department.getName(),
                department.getDescription(), department.getCreatedAt());
    }
}
