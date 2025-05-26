package org.psk.demo.interceptors;

import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;

@PerformanceMonitored
@Interceptor
public class PerformanceInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(PerformanceInterceptor.class);
    private static final Logger performanceLogger = LoggerFactory.getLogger("PERFORMANCE");

    @AroundInvoke
    public Object monitorPerformance(InvocationContext context) throws Exception {
        long startTime = System.currentTimeMillis();
        Method method = context.getMethod();
        String className = context.getTarget().getClass().getSimpleName();
        String methodName = method.getName();

        // Get performance monitoring configuration
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
        // First check method-level annotation
        PerformanceMonitored methodAnnotation = method.getAnnotation(PerformanceMonitored.class);
        if (methodAnnotation != null) {
            return methodAnnotation;
        }

        // Then check class-level annotation
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

        // Always log slow operations
        if (executionTime > slowThreshold) {
            performanceLogger.warn("SLOW_OPERATION: {} | Status: {} | ExecutionTime: {}ms | Threshold: {}ms",
                    operation, status, executionTime, slowThreshold);

            if (exception != null) {
                performanceLogger.warn("SLOW_OPERATION_ERROR: {} | Error: {}",
                        operation, exception.getMessage());
            }
        }

        // Log all operations if configured to do so
        if (alwaysLog) {
            performanceLogger.info("PERFORMANCE: {} | Status: {} | ExecutionTime: {}ms",
                    operation, status, executionTime);
        }

        // Log very fast operations (might indicate caching or early returns)
        if (executionTime < 5 && success) {
            performanceLogger.debug("FAST_OPERATION: {} | ExecutionTime: {}ms",
                    operation, executionTime);
        }

        // Log operations with moderate execution time for analysis
        if (executionTime > 100 && executionTime <= slowThreshold) {
            performanceLogger.debug("MODERATE_OPERATION: {} | Status: {} | ExecutionTime: {}ms",
                    operation, status, executionTime);
        }
    }
}