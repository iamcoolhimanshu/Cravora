package com.codeWithHimanshu.cravora.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.codeWithHimanshu.cravora")
@EnableCaching
@EnableJpaRepositories(basePackages = "com.codeWithHimanshu.cravora")
@EntityScan(basePackages = "com.codeWithHimanshu.cravora")
public class CravoraApplication {
	public static void main(String[] args) {
		SpringApplication.run(CravoraApplication.class, args);
	}
}
