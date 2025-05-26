package org.psk.demo.config;

import org.psk.demo.interceptors.AuditInterceptor;
import org.psk.demo.interceptors.PerformanceInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class InterceptorConfiguration implements WebMvcConfigurer {

    @Autowired
    private AuditInterceptor auditInterceptor;

    @Autowired
    private PerformanceInterceptor performanceInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor((HandlerInterceptor) auditInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns("/api/auth/login", "/api/auth/signup"); // Don't audit login attempts

        registry.addInterceptor((HandlerInterceptor) performanceInterceptor)
                .addPathPatterns("/api/**");
    }
}