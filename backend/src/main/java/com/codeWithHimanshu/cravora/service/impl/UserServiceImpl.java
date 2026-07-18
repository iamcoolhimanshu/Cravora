package com.codeWithHimanshu.cravora.service.impl;

import com.codeWithHimanshu.cravora.entity.User;
import com.codeWithHimanshu.cravora.repository.UserRepository;
import com.codeWithHimanshu.cravora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User register(User user) {
        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(user.getRole() != null ? user.getRole() : "USER");
        user.setWalletBalance(1000.0);
        return userRepository.save(user);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
