package org.psk.demo.controllers;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.psk.demo.dto.request.CreateGroupRequest;
import org.psk.demo.dto.response.ErrorResponse;
import org.psk.demo.dto.response.GroupResponse;
import org.psk.demo.services.GroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "http://localhost:3000")
public class GroupController {

    @Autowired
    private GroupService groupService;

    // Helper method to get user ID from session or header
    private Long getUserId(HttpSession session, String userIdHeader) {
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            try {
                return Long.parseLong(userIdHeader);
            } catch (NumberFormatException e) {
                // Fall back to session
            }
        }

        // Try to get from session (if you implement session storage)
        Object userIdObj = session.getAttribute("userId");
        if (userIdObj != null) {
            return (Long) userIdObj;
        }

        return null;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            BindingResult bindingResult,
            HttpSession session,
            @RequestHeader(value = "User-Id", required = false) String userIdHeader) {

        if (bindingResult.hasErrors()) {
            String errors = bindingResult.getFieldErrors()
                    .stream()
                    .map(DefaultMessageSourceResolvable::getDefaultMessage)
                    .collect(Collectors.joining(", "));
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse(errors, false));
        }

        Long userId = getUserId(session, userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User not authenticated", false));
        }

        GroupResponse response = groupService.createGroup(request, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/my-groups")
    public ResponseEntity<?> getMyGroups(
            HttpSession session,
            @RequestHeader(value = "User-Id", required = false) String userIdHeader) {

        Long userId = getUserId(session, userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User not authenticated", false));
        }

        List<GroupResponse> groups = groupService.getUserGroups(userId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroup(
            @PathVariable Long groupId,
            HttpSession session,
            @RequestHeader(value = "User-Id", required = false) String userIdHeader) {

        Long userId = getUserId(session, userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User not authenticated", false));
        }

        GroupResponse response = groupService.getGroupById(groupId, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
    }

    @PostMapping("/{groupId}/members")
    public ResponseEntity<?> addMember(
            @PathVariable Long groupId,
            @RequestBody Map<String, String> request,
            HttpSession session,
            @RequestHeader(value = "User-Id", required = false) String userIdHeader) {

        Long userId = getUserId(session, userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User not authenticated", false));
        }

        String username = request.get("username");
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Username is required", false));
        }

        GroupResponse response = groupService.addMemberToGroup(groupId, username.trim(), userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{groupId}/members/{userIdToRemove}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long groupId,
            @PathVariable Long userIdToRemove,
            HttpSession session,
            @RequestHeader(value = "User-Id", required = false) String userIdHeader) {

        Long userId = getUserId(session, userIdHeader);
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ErrorResponse("User not authenticated", false));
        }

        GroupResponse response = groupService.removeMemberFromGroup(groupId, userIdToRemove, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/check-name/{name}")
    public ResponseEntity<Map<String, Boolean>> checkGroupNameAvailability(@PathVariable String name) {
        boolean isAvailable = groupService.isGroupNameAvailable(name);
        return ResponseEntity.ok(Map.of("available", isAvailable));
    }
}