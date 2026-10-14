package com.example.ems.service;

import com.example.ems.dto.DepartmentRequest;
import com.example.ems.model.Department;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DepartmentService {
    private final DepartmentRepository departments;
    private final EmployeeRepository employees;

    public DepartmentService(DepartmentRepository departments, EmployeeRepository employees) {
        this.departments = departments;
        this.employees = employees;
    }

    @Transactional(readOnly = true)
    public List<Department> list() {
        return departments.findAll().stream()
                .sorted((first, second) -> first.getName().compareToIgnoreCase(second.getName()))
                .toList();
    }

    @Transactional
    public Department create(DepartmentRequest request) {
        ensureNameAvailable(request.name(), null);
        Department department = new Department();
        request.update(department);
        return departments.save(department);
    }

    @Transactional
    public Department update(Long id, DepartmentRequest request) {
        Department department = findDepartment(id);
        ensureNameAvailable(request.name(), id);
        request.update(department);
        return department;
    }

    @Transactional
    public void delete(Long id) {
        Department department = findDepartment(id);
        if (employees.countByDepartment_Id(id) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Reassign employees before deleting this department.");
        }
        departments.delete(department);
    }

    private Department findDepartment(Long id) {
        return departments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Department not found."));
    }

    private void ensureNameAvailable(String name, Long currentId) {
        boolean alreadyExists = currentId == null
                ? departments.existsByNameIgnoreCase(name.trim())
                : departments.existsByNameIgnoreCaseAndIdNot(name.trim(), currentId);
        if (alreadyExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A department with this name already exists.");
        }
    }
}
