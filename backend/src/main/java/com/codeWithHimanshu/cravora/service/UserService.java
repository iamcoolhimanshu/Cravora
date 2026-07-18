package com.codeWithHimanshu.cravora.service;

import com.codeWithHimanshu.cravora.entity.User;

public interface UserService {
    User register(User user);

    User findByEmail(String email);
}
