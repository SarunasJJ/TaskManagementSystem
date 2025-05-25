package org.psk.demo.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.psk.demo.entity.TaskStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {
    private Long version;

    @Size(max = 100, message = "Title must be less than 100 characters")
    private String title;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    private LocalDateTime deadline;

    private TaskStatus status;

    private Long assignedUserId;
}