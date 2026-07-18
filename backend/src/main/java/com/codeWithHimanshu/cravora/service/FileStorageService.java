package com.codeWithHimanshu.cravora.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String saveFile(MultipartFile file);
}
