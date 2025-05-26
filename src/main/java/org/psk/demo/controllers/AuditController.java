package org.psk.demo.controllers;

import org.psk.demo.entity.AuditLog;
import org.psk.demo.interceptors.Audited;
import org.psk.demo.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = "http://localhost:3000")
@Audited(value = "Audit Log Access")
public class AuditController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/recent")
    @Audited(value = "View Recent Audit Logs")
    public ResponseEntity<Page<AuditLog>> getRecentAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("User-Id") Long userId) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> auditLogs = auditLogRepository.findAll(pageable);
        return ResponseEntity.ok(auditLogs);
    }

    @GetMapping("/user/{targetUserId}")
    @Audited(value = "View User Audit Logs", logParameters = true)
    public ResponseEntity<List<AuditLog>> getUserAuditLogs(
            @PathVariable Long targetUserId,
            @RequestHeader("User-Id") Long currentUserId) {

        List<AuditLog> userLogs = auditLogRepository.findByUserIdOrderByTimestampDesc(targetUserId);
        return ResponseEntity.ok(userLogs);
    }

    @GetMapping("/date-range")
    @Audited(value = "View Audit Logs by Date Range", logParameters = true)
    public ResponseEntity<List<AuditLog>> getAuditLogsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestHeader("User-Id") Long userId) {

        List<AuditLog> logs = auditLogRepository.findByTimestampBetween(startDate, endDate);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/result/{result}")
    @Audited(value = "View Audit Logs by Result", logParameters = true)
    public ResponseEntity<List<AuditLog>> getAuditLogsByResult(
            @PathVariable AuditLog.OperationResult result,
            @RequestHeader("User-Id") Long userId) {

        List<AuditLog> logs = auditLogRepository.findByOperationResultOrderByTimestampDesc(result);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/slow-operations")
    @Audited(value = "View Slow Operations")
    public ResponseEntity<List<AuditLog>> getSlowOperations(
            @RequestParam(defaultValue = "1000") Long thresholdMs,
            @RequestHeader("User-Id") Long userId) {

        List<AuditLog> slowOps = auditLogRepository.findSlowOperations(thresholdMs);
        return ResponseEntity.ok(slowOps);
    }

    @GetMapping("/statistics")
    @Audited(value = "View Audit Statistics")
    public ResponseEntity<Map<String, Object>> getAuditStatistics(
            @RequestHeader("User-Id") Long userId) {

        LocalDateTime last24Hours = LocalDateTime.now().minusHours(24);
        LocalDateTime lastWeek = LocalDateTime.now().minusWeeks(1);

        long totalOperations = auditLogRepository.count();
        long operationsLast24h = auditLogRepository.findByTimestampBetween(last24Hours, LocalDateTime.now()).size();
        long operationsLastWeek = auditLogRepository.findByTimestampBetween(lastWeek, LocalDateTime.now()).size();
        long failedOperations = auditLogRepository.findByOperationResultOrderByTimestampDesc(AuditLog.OperationResult.FAILURE).size();
        long slowOperations = auditLogRepository.findSlowOperations(1000L).size();

        Map<String, Object> statistics = Map.of(
                "totalOperations", totalOperations,
                "operationsLast24Hours", operationsLast24h,
                "operationsLastWeek", operationsLastWeek,
                "failedOperations", failedOperations,
                "slowOperations", slowOperations,
                "successRate", totalOperations > 0 ? ((double)(totalOperations - failedOperations) / totalOperations * 100) : 0
        );

        return ResponseEntity.ok(statistics);
    }

    @GetMapping("/user-activity/{targetUserId}")
    @Audited(value = "Check User Activity", logParameters = true)
    public ResponseEntity<Map<String, Object>> getUserActivity(
            @PathVariable Long targetUserId,
            @RequestParam(defaultValue = "24") int hours,
            @RequestHeader("User-Id") Long currentUserId) {

        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        long activityCount = auditLogRepository.countUserOperationsSince(targetUserId, since);

        Map<String, Object> activity = Map.of(
                "userId", targetUserId,
                "operationCount", activityCount,
                "timeWindowHours", hours,
                "since", since
        );

        return ResponseEntity.ok(activity);
    }
}