package org.psk.demo.interceptors;

import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

@PerformanceMonitored
@Interceptor
@Component
@Order(2)
public class PerformanceInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceInterceptor.class);
    private static final Logger performanceLogger = LoggerFactory.getLogger("PERFORMANCE");

    @AroundInvoke
    public Object monitorPerformance(InvocationContext context) throws Exception {
        long startTime = System.currentTimeMillis();
        Method method = context.getMethod();
        String className = context.getTarget().getClass().getSimpleName();
        String methodName = method.getName();

        PerformanceMonitored performanceConfig = getPerformanceConfig(method, context.getTarget().getClass());

        long slowThreshold = performanceConfig != null ?
                performanceConfig.slowThresholdMs() : 1000L;
        boolean alwaysLog = performanceConfig != null &&
                performanceConfig.alwaysLog();

        Object result = null;
        boolean success = true;
        Exception thrownException = null;

        try {
            result = context.proceed();
            return result;

        } catch (Exception e) {
            success = false;
            thrownException = e;
            throw e;

        } finally {
            long executionTime = System.currentTimeMillis() - startTime;

            // Log performance metrics
            logPerformanceMetrics(
                    className,
                    methodName,
                    executionTime,
                    slowThreshold,
                    alwaysLog,
                    success,
                    thrownException
            );
        }
    }

    private PerformanceMonitored getPerformanceConfig(Method method, Class<?> targetClass) {
        PerformanceMonitored methodAnnotation = method.getAnnotation(PerformanceMonitored.class);
        if (methodAnnotation != null) {
            return methodAnnotation;
        }

        return targetClass.getAnnotation(PerformanceMonitored.class);
    }

    private void logPerformanceMetrics(
            String className,
            String methodName,
            long executionTime,
            long slowThreshold,
            boolean alwaysLog,
            boolean success,
            Exception exception) {

        String operation = className + "." + methodName;
        String status = success ? "SUCCESS" : "FAILURE";

        if (executionTime > slowThreshold) {
            performanceLogger.warn("SLOW_OPERATION: {} | Status: {} | ExecutionTime: {}ms | Threshold: {}ms",
                    operation, status, executionTime, slowThreshold);

            if (exception != null) {
                performanceLogger.warn("SLOW_OPERATION_ERROR: {} | Error: {}",
                        operation, exception.getMessage());
            }
        }

        if (alwaysLog) {
            performanceLogger.info("PERFORMANCE: {} | Status: {} | ExecutionTime: {}ms",
                    operation, status, executionTime);
        }

        if (executionTime < 5 && success) {
            performanceLogger.debug("FAST_OPERATION: {} | ExecutionTime: {}ms",
                    operation, executionTime);
        }

        if (executionTime > 100 && executionTime <= slowThreshold) {
            performanceLogger.debug("MODERATE_OPERATION: {} | Status: {} | ExecutionTime: {}ms",
                    operation, status, executionTime);
        }
    }
}