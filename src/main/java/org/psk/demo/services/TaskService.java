package org.psk.demo.services;

import lombok.Getter;
import lombok.Setter;
import org.psk.demo.dto.request.TaskRequest;
import org.psk.demo.dto.request.UpdateTaskRequest;
import org.psk.demo.dto.response.AuthenticationResponse;
import org.psk.demo.dto.response.TaskListResponse;
import org.psk.demo.dto.response.TaskResponse;
import org.psk.demo.entity.Task;
import org.psk.demo.entity.TaskStatus;
import org.psk.demo.repository.TaskRepository;
import org.psk.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskService {
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    public AuthenticationResponse createTask(TaskRequest taskRequest, Long userId) {
        try{
            if(!userRepository.existsById(userId)) {
                return new AuthenticationResponse("User does not exist!", null, null, false);
            }

            if(taskRequest.getDeadline().isBefore(LocalDateTime.now())){
                return new AuthenticationResponse("Deadline must be in the future!", null, null, false);
            }

            if(taskRequest.getUserId() != null && !userRepository.existsById(taskRequest.getUserId())){
                return new AuthenticationResponse("Assigned user does not exist!", null, null, false);
            }

            Task task = new Task();
            task.setTitle(taskRequest.getTitle());
            task.setDescription(taskRequest.getDescription());
            task.setDeadline(taskRequest.getDeadline());
            task.setGroupId(taskRequest.getGroupId());
            task.setUserId(taskRequest.getUserId());
            task.setCreatedBy(userId);

            Task savedTask = taskRepository.save(task);
            return new AuthenticationResponse("Task created successfully!", savedTask.getTitle(), savedTask.getId(), true);
        } catch (Exception e) {
            return new AuthenticationResponse("Could not create task! " + e.getMessage(), null, null, false);
        }
    }

    public AuthenticationResponse updateTask(Long taskId, UpdateTaskRequest request, Long userId) {
        try {
            Optional<Task> optionalTask = taskRepository.findById(taskId);
            if (optionalTask.isEmpty()) {
                return new AuthenticationResponse("Task not found", null, null, false);
            }

            Task task = optionalTask.get();

            if (request.getVersion() != null && !request.getVersion().equals(task.getVersion())) {
                return new OptimisticLockResponse(
                        "Task has been modified by another user. Please refresh and try again.",
                        task.getVersion(),
                        convertToTaskResponse(task),
                        false
                );
            }

            if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
                task.setTitle(request.getTitle());
            }
            if (request.getDescription() != null) {
                task.setDescription(request.getDescription());
            }
            if (request.getDeadline() != null) {
                if (request.getDeadline().isBefore(LocalDateTime.now())) {
                    return new AuthenticationResponse("Deadline must be in the future", null, null, false);
                }
                task.setDeadline(request.getDeadline());
            }
            if (request.getStatus() != null) {
                task.setStatus(request.getStatus());
            }
            if (request.getAssignedUserId() != null) {
                if (!userRepository.existsById(request.getAssignedUserId())) {
                    return new AuthenticationResponse("Assigned user not found", null, null, false);
                }
                task.setUserId(request.getAssignedUserId());
            }

            Task savedTask = taskRepository.save(task);
            return new AuthenticationResponse("Task updated successfully", null, taskId, true);

        } catch (OptimisticLockingFailureException e) {
            Optional<Task> freshTask = taskRepository.findById(taskId);
            if (freshTask.isPresent()) {
                return new OptimisticLockResponse(
                        "Task has been modified by another user while you were editing. Please review the current version and try again.",
                        freshTask.get().getVersion(),
                        convertToTaskResponse(freshTask.get()),
                        false
                );
            } else {
                return new AuthenticationResponse("Task has been deleted by another user", null, null, false);
            }
        } catch (Exception e) {
            return new AuthenticationResponse("Failed to update task: " + e.getMessage(), null, null, false);
        }
    }

    public AuthenticationResponse deleteTask(Long taskId, Long userId) {
        try {
            Optional<Task> optionalTask = taskRepository.findById(taskId);
            if (optionalTask.isEmpty()) {
                return new AuthenticationResponse("Task not found", null, null, false);
            }

            taskRepository.deleteById(taskId);
            return new AuthenticationResponse("Task deleted successfully", null, taskId, true);

        } catch (Exception e) {
            return new AuthenticationResponse("Failed to delete task: " + e.getMessage(), null, null, false);
        }
    }

    @Setter
    @Getter
    public static class OptimisticLockResponse extends AuthenticationResponse {
        private Long currentVersion;
        private TaskResponse currentData;

        public OptimisticLockResponse(String message, Long currentVersion, TaskResponse currentData, boolean success) {
            super(message, null, null, success);
            this.currentVersion = currentVersion;
            this.currentData = currentData;
        }
    }

    public TaskResponse getTaskById(Long taskId) {
        Optional<Task> optionalTask = taskRepository.findById(taskId);
        return optionalTask.map(this::convertToTaskResponse).orElse(null);
    }

    public TaskListResponse getTasksByGroup(Long groupId) {
        try {
            List<Task> tasks = taskRepository.findByGroupIdOrderByDeadlineAsc(groupId);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(this::convertToTaskResponse)
                    .collect(Collectors.toList());

            return new TaskListResponse("Tasks retrieved successfully", taskResponses, taskResponses.size(), true);
        } catch (Exception e) {
            return new TaskListResponse("Failed to retrieve tasks: " + e.getMessage(), null, 0, false);
        }
    }

    public AuthenticationResponse assignTask(Long taskId, Long assignedUserId, Long userId) {
        try {
            Optional<Task> optionalTask = taskRepository.findById(taskId);
            if (optionalTask.isEmpty()) {
                return new AuthenticationResponse("Task not found", null, null, false);
            }

            if (!userRepository.existsById(assignedUserId)) {
                return new AuthenticationResponse("Assigned user not found", null, null, false);
            }

            Task task = optionalTask.get();
            task.setUserId(assignedUserId);
            taskRepository.save(task);

            return new AuthenticationResponse("Task assigned successfully", null, taskId, true);
        } catch (Exception e) {
            return new AuthenticationResponse("Failed to assign task: " + e.getMessage(), null, null, false);
        }
    }

    public TaskListResponse getTasksByGroupAndStatus(Long groupId, TaskStatus status) {
        try {
            List<Task> tasks = taskRepository.findByGroupIdAndStatus(groupId, status);
            List<TaskResponse> taskResponses = tasks.stream()
                    .map(this::convertToTaskResponse)
                    .collect(Collectors.toList());

            return new TaskListResponse("Tasks retrieved successfully", taskResponses, taskResponses.size(), true);
        } catch (Exception e) {
            return new TaskListResponse("Failed to retrieve tasks: " + e.getMessage(), null, 0, false);
        }
    }


    private TaskResponse convertToTaskResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setVersion(task.getVersion());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setDeadline(task.getDeadline());
        response.setStatus(task.getStatus());
        response.setGroupId(task.getGroupId());
        response.setAssignedUserId(task.getUserId());
        response.setCreatedBy(task.getCreatedBy());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());

        if (task.getUserId() != null) {
            userRepository.findById(task.getUserId())
                    .ifPresent(user -> response.setAssignedUsername(user.getUsername()));
        }

        userRepository.findById(task.getCreatedBy())
                .ifPresent(user -> response.setCreatedByUsername(user.getUsername()));

        return response;
    }

}
