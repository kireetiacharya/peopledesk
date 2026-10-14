package com.example.ems.security;

import com.example.ems.model.Employee;
import com.example.ems.repository.EmployeeRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class EmployeeUserDetailsService implements UserDetailsService {
    private final EmployeeRepository employees;

    public EmployeeUserDetailsService(EmployeeRepository employees) {
        this.employees = employees;
    }

    @Override
    public UserDetails loadUserByUsername(String email) {
        Employee employee = employees.findByEmailIgnoreCase(email)
                .filter(Employee::isActive)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found or inactive."));
        return userDetails(employee);
    }

    public UserDetails loadUserById(Long id) {
        Employee employee = employees.findById(id)
                .filter(Employee::isActive)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found or inactive."));
        return userDetails(employee);
    }

    private UserDetails userDetails(Employee employee) {
        return User.withUsername(employee.getEmail())
                .password(employee.getPassword())
                .roles(employee.getRole().name())
                .build();
    }
}
