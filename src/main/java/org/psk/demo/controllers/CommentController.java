package org.psk.demo.controllers;

import jakarta.validation.Valid;
import org.psk.demo.dto.request.CommentRequest;
import org.psk.demo.dto.response.AuthenticationResponse;
import org.psk.demo.dto.response.CommentListResponse;
import org.psk.demo.dto.response.ErrorResponse;
import org.psk.demo.services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups/{groupId}/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping
    public ResponseEntity<?> createComment(
            @PathVariable Long groupId,
            @Valid @RequestBody CommentRequest request,
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

        AuthenticationResponse response = commentService.createComment(groupId, request, userId);

        if (response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping
    public ResponseEntity<CommentListResponse> getComments(
            @PathVariable Long groupId,
            @RequestHeader("User-Id") Long userId) {

        CommentListResponse response = commentService.getCommentsByGroup(groupId, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<CommentListResponse> getRecentComments(
            @PathVariable Long groupId,
            @RequestHeader("User-Id") Long userId) {

        CommentListResponse response = commentService.getRecentCommentsByGroup(groupId, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable Long groupId,
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request,
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

        AuthenticationResponse response = commentService.updateComment(commentId, request, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long groupId,
            @PathVariable Long commentId,
            @RequestHeader("User-Id") Long userId) {

        AuthenticationResponse response = commentService.deleteComment(commentId, userId);

        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getCommentCount(@PathVariable Long groupId) {
        long count = commentService.getCommentCountByGroup(groupId);
        return ResponseEntity.ok(java.util.Map.of("count", count));
    }
}