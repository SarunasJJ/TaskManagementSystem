package org.psk.demo.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AuditService {

    private static final Logger auditLogger = LoggerFactory.getLogger("AUDIT");
    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);
    private static final DateTimeFormatter TIMESTAMP_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

    @Value("${app.audit.enabled:true}")
    private boolean auditEnabled;

    @Async
    public void logAuditEvent(
            Long userId,
            String username,
            String userRoles,
            String className,
            String methodName,
            String operationDescription,
            Long executionTimeMs,
            String result,
            String errorMessage,
            String ipAddress,
            String sessionId) {

        if (!auditEnabled) {
            return;
        }

        try {
            String timestamp = LocalDateTime.now().format(TIMESTAMP_FORMATTER);

            StringBuilder auditLog = new StringBuilder();
            auditLog.append("AUDIT: [").append(timestamp).append("] ");
            auditLog.append("User: ").append(username != null ? username : "SYSTEM").append("(").append(userId != null ? userId : "N/A").append(") ");
            auditLog.append("| Operation: ").append(className).append(".").append(methodName);
            auditLog.append(" | Description: ").append(operationDescription);
            auditLog.append(" | Result: ").append(result);
            auditLog.append(" | Time: ").append(executionTimeMs).append("ms");

            if (ipAddress != null) {
                auditLog.append(" | IP: ").append(ipAddress);
            }

            if (sessionId != null) {
                auditLog.append(" | Session: ").append(sessionId);
            }

            if (errorMessage != null) {
                auditLog.append(" | Error: ").append(errorMessage);
            }

            // Log to audit file
            auditLogger.info(auditLog.toString());

        } catch (Exception e) {
            logger.error("Failed to log audit event: {}", e.getMessage());
        }
    }
}