package com.example.ems.config;

import com.example.ems.model.Department;
import com.example.ems.model.Employee;
import com.example.ems.model.Role;
import com.example.ems.repository.DepartmentRepository;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initializeData(
            EmployeeRepository employees,
            DepartmentRepository departments,
            PasswordEncoder passwordEncoder,
            @Value("${app.admin.email}") String adminEmail,
            @Value("${app.admin.password}") String adminPassword) {
        return args -> {
            if (!employees.existsByEmailIgnoreCase(adminEmail)) {
                Employee admin = new Employee();
                admin.setName("System Administrator");
                admin.setEmail(adminEmail.trim().toLowerCase());
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(Role.ADMIN);
                employees.save(admin);
            }
            createDepartmentIfMissing(departments, "Engineering", "Product engineering and development.");
            createDepartmentIfMissing(departments, "Human Resources", "People operations and recruitment.");
        };
    }

    private void createDepartmentIfMissing(DepartmentRepository departments, String name, String description) {
        if (!departments.existsByNameIgnoreCase(name)) {
            Department department = new Department();
            department.setName(name);
            department.setDescription(description);
            departments.save(department);
        }
    }
}
