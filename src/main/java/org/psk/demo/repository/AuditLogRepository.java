package org.psk.demo.repository;

import org.psk.demo.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);

    List<AuditLog> findByClassNameAndMethodNameOrderByTimestampDesc(String className, String methodName);

    List<AuditLog> findByOperationResultOrderByTimestampDesc(AuditLog.OperationResult result);

    @Query("SELECT a FROM AuditLog a WHERE a.timestamp BETWEEN :startDate AND :endDate ORDER BY a.timestamp DESC")
    List<AuditLog> findByTimestampBetween(@Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM AuditLog a WHERE a.executionTimeMs > :threshold ORDER BY a.executionTimeMs DESC")
    List<AuditLog> findSlowOperations(@Param("threshold") Long thresholdMs);

    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.userId = :userId AND a.timestamp > :since")
    long countUserOperationsSince(@Param("userId") Long userId, @Param("since") LocalDateTime since);
}