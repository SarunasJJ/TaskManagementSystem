package org.psk.demo.repository;

import org.psk.demo.entity.Task;
import org.psk.demo.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByGroupId(Long groupId);

    List<Task> findByGroupIdAndStatus(Long groupId, TaskStatus status);

    List<Task> findByGroupIdOrderByDeadlineAsc(Long groupId);

    long countByGroupIdAndStatus(Long groupId, TaskStatus status);
}