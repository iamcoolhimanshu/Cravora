package com.codeWithHimanshu.cravora.service.impl;

import com.codeWithHimanshu.cravora.entity.User;
import com.codeWithHimanshu.cravora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByEmail(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        String roleName = user.getRole();
        if (roleName != null && !roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(roleName != null ? roleName : "ROLE_USER"))
        );
    }
}
