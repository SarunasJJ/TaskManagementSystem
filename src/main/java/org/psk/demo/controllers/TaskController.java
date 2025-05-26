package org.psk.demo.controllers;

import jakarta.validation.Valid;
import org.psk.demo.dto.request.TaskRequest;
import org.psk.demo.dto.request.UpdateTaskRequest;
import org.psk.demo.dto.response.AuthenticationResponse;
import org.psk.demo.dto.response.ErrorResponse;
import org.psk.demo.dto.response.TaskListResponse;
import org.psk.demo.dto.response.TaskResponse;
import org.psk.demo.entity.TaskStatus;
import org.psk.demo.services.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {
    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(@Valid @RequestBody TaskRequest taskRequest, BindingResult bindingResult, @RequestHeader("User-Id") Long userId) {
        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(errors, false));
        }

        AuthenticationResponse response = taskService.createTask(taskRequest, userId);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<?> updateTask(@PathVariable Long taskId,
                                        @Valid @RequestBody UpdateTaskRequest request,
                                        BindingResult bindingResult,
                                        @RequestHeader("User-Id") Long userId) {
        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(errors, false));
        }

        AuthenticationResponse response = taskService.updateTask(taskId, request, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId,
                                        @RequestHeader("User-Id") Long userId) {
        AuthenticationResponse response = taskService.deleteTask(taskId, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<?> getTask(@PathVariable Long taskId) {
        TaskResponse response = taskService.getTaskById(taskId);

        if (response != null) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<TaskListResponse> getTasksByGroup(@PathVariable Long groupId) {
        TaskListResponse response = taskService.getTasksByGroup(groupId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/group/{groupId}/status/{status}")
    public ResponseEntity<TaskListResponse> getTasksByGroupAndStatus(@PathVariable Long groupId,
                                                                     @PathVariable TaskStatus status) {
        TaskListResponse response = taskService.getTasksByGroupAndStatus(groupId, status);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{taskId}/assign/{assignedUserId}")
    public ResponseEntity<?> assignTask(@PathVariable Long taskId,
                                        @PathVariable Long assignedUserId,
                                        @RequestHeader("User-Id") Long userId) {
        AuthenticationResponse response = taskService.assignTask(taskId, assignedUserId, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{taskId}/assign")
    public ResponseEntity<?> unassignTask(@PathVariable Long taskId,
                                          @RequestHeader("User-Id") Long userId) {
        UpdateTaskRequest request = new UpdateTaskRequest();
        request.setAssignedUserId(null);

        AuthenticationResponse response = taskService.updateTask(taskId, request, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{taskId}/status/{status}")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long taskId,
                                              @PathVariable TaskStatus status,
                                              @RequestHeader("User-Id") Long userId) {
        UpdateTaskRequest request = new UpdateTaskRequest();
        request.setStatus(status);

        AuthenticationResponse response = taskService.updateTask(taskId, request, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}