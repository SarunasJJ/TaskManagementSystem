package org.psk.demo.interceptors;

import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import org.psk.demo.config.SpringContextHolder;
import org.psk.demo.services.AuditService;
import org.psk.demo.services.UserContextService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.reflect.Method;

@Audited
@Interceptor
public class AuditInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(AuditInterceptor.class);

    @AroundInvoke
    public Object auditMethodExecution(InvocationContext context) throws Exception {
        long startTime = System.currentTimeMillis();
        Method method = context.getMethod();

        // Get Spring beans
        AuditService auditService = SpringContextHolder.getBean(AuditService.class);
        UserContextService userContextService = SpringContextHolder.getBean(UserContextService.class);

        if (auditService == null || userContextService == null) {
            logger.warn("Could not get Spring beans for auditing, proceeding without audit");
            return context.proceed();
        }

        // Extract audit configuration
        Audited auditedAnnotation = getAuditedAnnotation(method, context.getTarget().getClass());

        // Gather context information
        Long userId = userContextService.getCurrentUserId();
        String username = userContextService.getCurrentUsername();
        String userRoles = userContextService.getCurrentUserRoles();
        String className = context.getTarget().getClass().getSimpleName();
        String methodName = method.getName();
        String ipAddress = userContextService.getClientIpAddress();
        String sessionId = userContextService.getSessionId();

        // Build operation description
        String operationDescription = buildOperationDescription(auditedAnnotation, className, methodName);

        String result = null;
        String errorMessage = null;
        Object methodResult = null;

        try {
            // Execute the actual method
            methodResult = context.proceed();
            result = "SUCCESS";

        } catch (Exception e) {
            result = "FAILURE";
            errorMessage = e.getClass().getSimpleName() + ": " + e.getMessage();
            logger.error("Audited method {} failed: {}", methodName, e.getMessage());
            throw e; // Re-throw the exception

        } finally {
            long executionTime = System.currentTimeMillis() - startTime;

            // Log audit information asynchronously
            auditService.logAuditEvent(
                    userId,
                    username,
                    userRoles,
                    className,
                    methodName,
                    operationDescription,
                    executionTime,
                    result,
                    errorMessage,
                    ipAddress,
                    sessionId
            );
        }

        return methodResult;
    }

    private Audited getAuditedAnnotation(Method method, Class<?> targetClass) {
        // First check method-level annotation
        Audited methodAnnotation = method.getAnnotation(Audited.class);
        if (methodAnnotation != null) {
            return methodAnnotation;
        }

        // Then check class-level annotation
        return targetClass.getAnnotation(Audited.class);
    }

    private String buildOperationDescription(Audited auditedAnnotation, String className, String methodName) {
        if (auditedAnnotation != null && !auditedAnnotation.value().isEmpty()) {
            return auditedAnnotation.value();
        }

        // Generate description based on method name patterns
        return generateDescriptionFromMethodName(className, methodName);
    }

    private String generateDescriptionFromMethodName(String className, String methodName) {
        String entityName = className.replace("Service", "").replace("Controller", "");

        if (methodName.startsWith("create")) {
            return "Create " + entityName;
        } else if (methodName.startsWith("update")) {
            return "Update " + entityName;
        } else if (methodName.startsWith("delete")) {
            return "Delete " + entityName;
        } else if (methodName.startsWith("get") || methodName.startsWith("find")) {
            return "Retrieve " + entityName;
        } else if (methodName.startsWith("login")) {
            return "User Login";
        } else if (methodName.startsWith("signUp")) {
            return "User Registration";
        } else if (methodName.startsWith("add")) {
            return "Add " + entityName;
        } else if (methodName.startsWith("remove")) {
            return "Remove " + entityName;
        } else {
            return className + " Operation";
        }
    }
}

// Keep SpringContextHolder.java as it was - needed to get Spring beans