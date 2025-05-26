package org.psk.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "username", length = 50)
    private String username;

    @Column(name = "user_roles", length = 500)
    private String userRoles;

    @Column(name = "class_name", length = 100, nullable = false)
    private String className;

    @Column(name = "method_name", length = 100, nullable = false)
    private String methodName;

    @Column(name = "operation_description", length = 500)
    private String operationDescription;

    @Column(name = "method_parameters", length = 2000)
    private String methodParameters;

    @Column(name = "return_value", length = 1000)
    private String returnValue;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @Column(name = "operation_result", length = 20)
    @Enumerated(EnumType.STRING)
    private OperationResult operationResult;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    public enum OperationResult {
        SUCCESS,
        FAILURE,
        PARTIAL_SUCCESS
    }

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}