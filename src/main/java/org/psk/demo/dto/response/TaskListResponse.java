package org.psk.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskListResponse {
    private String message;
    private List<TaskResponse> tasks;
    private int totalTasks;
    private boolean success;
}