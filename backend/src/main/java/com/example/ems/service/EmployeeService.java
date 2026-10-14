package com.example.ems.service;

import com.example.ems.dto.EmployeeRequest;
import com.example.ems.dto.EmployeeResponse;
import com.example.ems.dto.ProfileRequest;
import com.example.ems.model.Department;
import com.example.ems.model.Employee;
import com.example.ems.model.Role;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class EmployeeService {
    private final EmployeeRepository employees;
    private final DepartmentRepository departments;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employees, DepartmentRepository departments, PasswordEncoder passwordEncoder) {
        this.employees = employees;
        this.departments = departments;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<EmployeeResponse> list(String search) {
        String term = search == null ? "" : search.trim().toLowerCase();
        return employees.findByRole(Role.EMPLOYEE).stream()
                .filter(employee -> term.isEmpty()
                        || employee.getName().toLowerCase().contains(term)
                        || employee.getEmail().toLowerCase().contains(term)
                        || (employee.getDepartment() != null
                        && employee.getDepartment().getName().toLowerCase().contains(term)))
                .map(EmployeeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmployeeResponse get(Long id) {
        return employees.findByIdAndRole(id, Role.EMPLOYEE)
                .map(EmployeeResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));
    }

    @Transactional
    public EmployeeResponse create(EmployeeRequest request) {
        if (employees.existsByEmailIgnoreCase(request.email().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }
        if (request.password() == null || request.password().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A temporary password is required.");
        }
        Employee employee = new Employee();
        employee.setRole(Role.EMPLOYEE);
        employee.setPassword(passwordEncoder.encode(request.password()));
        apply(employee, request);
        return EmployeeResponse.from(employees.save(employee));
    }

    @Transactional
    public EmployeeResponse update(Long id, EmployeeRequest request) {
        Employee employee = findEmployee(id);
        employees.findByEmailIgnoreCase(request.email().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
                });
        apply(employee, request);
        if (request.password() != null && !request.password().isBlank()) {
            employee.setPassword(passwordEncoder.encode(request.password()));
        }
        return EmployeeResponse.from(employee);
    }

    @Transactional
    public EmployeeResponse updateProfile(String email, ProfileRequest request) {
        Employee employee = employees.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));
        employees.findByEmailIgnoreCase(request.email().trim())
                .filter(existing -> !existing.getId().equals(employee.getId()))
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
                });
        employee.setName(request.name().trim());
        employee.setEmail(request.email().trim().toLowerCase());
        employee.setPhone(blankToNull(request.phone()));
        employee.setAddress(blankToNull(request.address()));
        return EmployeeResponse.from(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getProfile(String email) {
        return employees.findByEmailIgnoreCase(email)
                .map(EmployeeResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));
    }

    @Transactional
    public void setActive(Long id, boolean active) {
        Employee employee = findEmployee(id);
        employee.setActive(active);
    }

    @Transactional
    public void delete(Long id) {
        employees.delete(findEmployee(id));
    }

    private Employee findEmployee(Long id) {
        return employees.findById(id)
                .filter(employee -> employee.getRole() == Role.EMPLOYEE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found."));
    }

    private void apply(Employee employee, EmployeeRequest request) {
        employee.setName(request.name().trim());
        employee.setEmail(request.email().trim().toLowerCase());
        employee.setPhone(blankToNull(request.phone()));
        employee.setAddress(blankToNull(request.address()));
        employee.setDepartment(request.departmentId() == null ? null
                : departments.findById(request.departmentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Department not found.")));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
