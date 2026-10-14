package com.example.ems.dto;

import com.example.ems.model.Department;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DepartmentRequest(
        @NotBlank @Size(max = 80) String name,
        @Size(max = 500) String description
) {
    public void update(Department department) {
        department.setName(name.trim());
        department.setDescription(description == null || description.isBlank() ? null : description.trim());
    }
}
