package org.psk.demo.config;

import org.psk.demo.interceptors.AuditInterceptor;
import org.psk.demo.interceptors.PerformanceInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.stereotype.Component;

@Component
public class InterceptorApplicationListener implements ApplicationListener<ContextRefreshedEvent> {

    @Autowired
    private AuditInterceptor auditInterceptor;

    @Autowired
    private PerformanceInterceptor performanceInterceptor;

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        System.out.println("Audit and Performance Interceptors initialized successfully");
    }
}