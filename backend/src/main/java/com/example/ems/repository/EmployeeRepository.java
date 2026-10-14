package com.example.ems.repository;

import com.example.ems.model.Employee;
import com.example.ems.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<Employee> findByRole(Role role);
    Optional<Employee> findByIdAndRole(Long id, Role role);
    long countByDepartment_Id(Long departmentId);
}
