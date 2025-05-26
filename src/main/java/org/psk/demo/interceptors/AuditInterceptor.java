package org.psk.demo.interceptors;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import org.psk.demo.entity.AuditLog;
import org.psk.demo.services.AuditService;
import org.psk.demo.services.UserContextService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;

@Audited
@Interceptor
@Component
@Order(1)
public class AuditInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(AuditInterceptor.class);

    @Autowired
    private AuditService auditService;

    @Autowired
    private UserContextService userContextService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @AroundInvoke
    public Object auditMethodExecution(InvocationContext context) throws Exception {
        long startTime = System.currentTimeMillis();
        Method method = context.getMethod();

        Audited auditedAnnotation = getAuditedAnnotation(method, context.getTarget().getClass());

        Long userId = userContextService.getCurrentUserId();
        String username = userContextService.getCurrentUsername();
        String userRoles = userContextService.getCurrentUserRoles();
        String className = context.getTarget().getClass().getSimpleName();
        String methodName = method.getName();
        String ipAddress = userContextService.getClientIpAddress();
        String sessionId = userContextService.getSessionId();

        String operationDescription = buildOperationDescription(auditedAnnotation, className, methodName);

        String methodParameters = null;
        if (auditedAnnotation != null && auditedAnnotation.logParameters()) {
            methodParameters = serializeParameters(context.getParameters());
        }

        AuditLog.OperationResult result = null;
        String returnValue = null;
        String errorMessage = null;
        Object methodResult = null;

        try {
            methodResult = context.proceed();
            result = AuditLog.OperationResult.SUCCESS;

            if (auditedAnnotation != null && auditedAnnotation.logReturnValue() && methodResult != null) {
                returnValue = serializeReturnValue(methodResult);
            }

        } catch (Exception e) {
            result = AuditLog.OperationResult.FAILURE;
            errorMessage = e.getClass().getSimpleName() + ": " + e.getMessage();
            logger.error("Audited method {} failed: {}", methodName, e.getMessage());
            throw e;

        } finally {
            long executionTime = System.currentTimeMillis() - startTime;

            try {
                AuditLog auditLog = auditService.createAuditLog(
                        userId,
                        username,
                        userRoles,
                        className,
                        methodName,
                        operationDescription,
                        methodParameters,
                        returnValue,
                        executionTime,
                        result,
                        errorMessage,
                        ipAddress,
                        sessionId
                );

                auditService.saveAuditLog(auditLog);

            } catch (Exception auditException) {
                logger.error("Failed to create audit log for {}.{}: {}",
                        className, methodName, auditException.getMessage());
            }
        }

        return methodResult;
    }

    private Audited getAuditedAnnotation(Method method, Class<?> targetClass) {
        Audited methodAnnotation = method.getAnnotation(Audited.class);
        if (methodAnnotation != null) {
            return methodAnnotation;
        }

        return targetClass.getAnnotation(Audited.class);
    }

    private String buildOperationDescription(Audited auditedAnnotation, String className, String methodName) {
        if (auditedAnnotation != null && !auditedAnnotation.value().isEmpty()) {
            return auditedAnnotation.value();
        }

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

    private String serializeParameters(Object[] parameters) {
        if (parameters == null || parameters.length == 0) {
            return "[]";
        }

        try {
            Object[] safeParams = Arrays.stream(parameters)
                    .map(this::sanitizeParameter)
                    .toArray();

            return objectMapper.writeValueAsString(safeParams);
        } catch (Exception e) {
            return "[Serialization failed: " + e.getMessage() + "]";
        }
    }

    private String serializeReturnValue(Object returnValue) {
        try {
            Object safeReturnValue = sanitizeParameter(returnValue);
            String serialized = objectMapper.writeValueAsString(safeReturnValue);

            if (serialized.length() > 500) {
                return serialized.substring(0, 500) + "... [truncated]";
            }

            return serialized;
        } catch (Exception e) {
            return "[Serialization failed: " + e.getMessage() + "]";
        }
    }

    private Object sanitizeParameter(Object param) {
        if (param == null) {
            return null;
        }

        String paramString = param.toString();

        if (paramString.toLowerCase().contains("password")) {
            return "[HIDDEN]";
        }

        if (paramString.length() > 200) {
            return paramString.substring(0, 200) + "... [truncated]";
        }

        return param;
    }
}