package org.psk.demo.services;

import org.psk.demo.entity.AuditLog;
import org.psk.demo.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditService {

    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Value("${app.audit.enabled:true}")
    private boolean auditEnabled;

    @Value("${app.audit.log-to-db:true}")
    private boolean logToDatabase;

    @Value("${app.audit.log-to-file:true}")
    private boolean logToFile;

    @Async
    public void saveAuditLog(AuditLog auditLog) {
        if (!auditEnabled) {
            return;
        }

        try {
            if (logToFile) {
                logToFile(auditLog);
            }

            if (logToDatabase) {
                auditLogRepository.save(auditLog);
            }

        } catch (Exception e) {
            logger.error("Failed to save audit log: {}", e.getMessage(), e);
        }
    }

    public AuditLog createAuditLog(
            Long userId,
            String username,
            String userRoles,
            String className,
            String methodName,
            String operationDescription,
            String methodParameters,
            String returnValue,
            Long executionTimeMs,
            AuditLog.OperationResult result,
            String errorMessage,
            String ipAddress,
            String sessionId) {

        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setUsername(username);
        auditLog.setUserRoles(userRoles);
        auditLog.setClassName(className);
        auditLog.setMethodName(methodName);
        auditLog.setOperationDescription(operationDescription);
        auditLog.setMethodParameters(methodParameters);
        auditLog.setReturnValue(returnValue);
        auditLog.setExecutionTimeMs(executionTimeMs);
        auditLog.setOperationResult(result);
        auditLog.setErrorMessage(errorMessage);
        auditLog.setIpAddress(ipAddress);
        auditLog.setSessionId(sessionId);
        auditLog.setTimestamp(LocalDateTime.now());

        return auditLog;
    }

    private void logToFile(AuditLog auditLog) {
        logger.info("AUDIT: [{}] User: {}({}) | Operation: {}.{} | Result: {} | Time: {}ms | Description: {} | IP: {} | Session: {}",
                auditLog.getTimestamp(),
                auditLog.getUsername(),
                auditLog.getUserId(),
                auditLog.getClassName(),
                auditLog.getMethodName(),
                auditLog.getOperationResult(),
                auditLog.getExecutionTimeMs(),
                auditLog.getOperationDescription(),
                auditLog.getIpAddress(),
                auditLog.getSessionId()
        );

        if (auditLog.getErrorMessage() != null) {
            logger.warn("AUDIT_ERROR: [{}] {}", auditLog.getTimestamp(), auditLog.getErrorMessage());
        }
    }
}