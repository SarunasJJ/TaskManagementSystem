package org.psk.demo.services;

import org.psk.demo.dto.request.CommentRequest;
import org.psk.demo.dto.response.AuthenticationResponse;
import org.psk.demo.dto.response.CommentListResponse;
import org.psk.demo.dto.response.CommentResponse;
import org.psk.demo.entity.Comment;
import org.psk.demo.entity.Group;
import org.psk.demo.entity.User;
import org.psk.demo.repository.CommentRepository;
import org.psk.demo.repository.GroupRepository;
import org.psk.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private UserRepository userRepository;

    public AuthenticationResponse createComment(Long groupId, CommentRequest request, Long userId) {
        try {
            // Verify user exists
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return new AuthenticationResponse("User not found!", null, null, false);
            }

            // Verify group exists
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) {
                return new AuthenticationResponse("Group not found!", null, null, false);
            }

            Group group = groupOpt.get();
            User user = userOpt.get();

            // Check if user is a member of the group
            if (!group.isMember(user) && !group.isCreator(user)) {
                return new AuthenticationResponse("You must be a member of this group to comment!", null, null, false);
            }

            // Create the comment
            Comment comment = new Comment();
            comment.setContent(request.getContent());
            comment.setGroupId(groupId);
            comment.setAuthorId(userId);

            Comment savedComment = commentRepository.save(comment);

            return new AuthenticationResponse("Comment posted successfully!", null, savedComment.getId(), true);

        } catch (Exception e) {
            return new AuthenticationResponse("Could not post comment! " + e.getMessage(), null, null, false);
        }
    }

    public AuthenticationResponse updateComment(Long commentId, CommentRequest request, Long userId) {
        try {
            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (commentOpt.isEmpty()) {
                return new AuthenticationResponse("Comment not found!", null, null, false);
            }

            Comment comment = commentOpt.get();

            // Only the author can edit their comment
            if (!comment.getAuthorId().equals(userId)) {
                return new AuthenticationResponse("You can only edit your own comments!", null, null, false);
            }

            // Update the comment content
            comment.setContent(request.getContent());
            commentRepository.save(comment);

            return new AuthenticationResponse("Comment updated successfully!", null, commentId, true);

        } catch (Exception e) {
            return new AuthenticationResponse("Could not update comment! " + e.getMessage(), null, null, false);
        }
    }

    public AuthenticationResponse deleteComment(Long commentId, Long userId) {
        try {
            Optional<Comment> commentOpt = commentRepository.findById(commentId);
            if (commentOpt.isEmpty()) {
                return new AuthenticationResponse("Comment not found!", null, null, false);
            }

            Comment comment = commentOpt.get();

            // Check if user can delete the comment (author or group creator)
            boolean canDelete = comment.getAuthorId().equals(userId);

            if (!canDelete) {
                // Check if user is the group creator
                Optional<Group> groupOpt = groupRepository.findById(comment.getGroupId());
                if (groupOpt.isPresent()) {
                    Group group = groupOpt.get();
                    canDelete = group.getCreator().getId().equals(userId);
                }
            }

            if (!canDelete) {
                return new AuthenticationResponse("You can only delete your own comments or comments in groups you created!", null, null, false);
            }

            commentRepository.delete(comment);

            return new AuthenticationResponse("Comment deleted successfully!", null, commentId, true);

        } catch (Exception e) {
            return new AuthenticationResponse("Could not delete comment! " + e.getMessage(), null, null, false);
        }
    }

    @Transactional(readOnly = true)
    public CommentListResponse getCommentsByGroup(Long groupId, Long userId) {
        try {
            // Verify user has access to the group
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) {
                return new CommentListResponse("Group not found!", null, 0, false);
            }

            Group group = groupOpt.get();
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return new CommentListResponse("User not found!", null, 0, false);
            }

            User user = userOpt.get();
            if (!group.isMember(user) && !group.isCreator(user)) {
                return new CommentListResponse("Access denied! You are not a member of this group.", null, 0, false);
            }

            // Get all comments for the group
            List<Comment> comments = commentRepository.findByGroupIdOrderByCreatedAtAsc(groupId);

            List<CommentResponse> commentResponses = comments.stream()
                    .map(comment -> convertToCommentResponse(comment, userId, group.getCreator().getId()))
                    .collect(Collectors.toList());

            return new CommentListResponse("Comments retrieved successfully!", commentResponses, commentResponses.size(), true);

        } catch (Exception e) {
            return new CommentListResponse("Could not retrieve comments! " + e.getMessage(), null, 0, false);
        }
    }

    @Transactional(readOnly = true)
    public CommentListResponse getRecentCommentsByGroup(Long groupId, Long userId) {
        try {
            // Verify user has access to the group
            Optional<Group> groupOpt = groupRepository.findById(groupId);
            if (groupOpt.isEmpty()) {
                return new CommentListResponse("Group not found!", null, 0, false);
            }

            Group group = groupOpt.get();
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return new CommentListResponse("User not found!", null, 0, false);
            }

            User user = userOpt.get();
            if (!group.isMember(user) && !group.isCreator(user)) {
                return new CommentListResponse("Access denied! You are not a member of this group.", null, 0, false);
            }

            // Get recent comments (last 24 hours)
            LocalDateTime since = LocalDateTime.now().minusHours(24);
            List<Comment> comments = commentRepository.findRecentCommentsByGroupId(groupId, since);

            List<CommentResponse> commentResponses = comments.stream()
                    .map(comment -> convertToCommentResponse(comment, userId, group.getCreator().getId()))
                    .collect(Collectors.toList());

            return new CommentListResponse("Recent comments retrieved successfully!", commentResponses, commentResponses.size(), true);

        } catch (Exception e) {
            return new CommentListResponse("Could not retrieve recent comments! " + e.getMessage(), null, 0, false);
        }
    }

    @Transactional(readOnly = true)
    public long getCommentCountByGroup(Long groupId) {
        return commentRepository.countByGroupId(groupId);
    }

    private CommentResponse convertToCommentResponse(Comment comment, Long currentUserId, Long groupCreatorId) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setGroupId(comment.getGroupId());
        response.setAuthorId(comment.getAuthorId());
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        response.setEdited(comment.isEdited());

        // Set author username
        userRepository.findById(comment.getAuthorId())
                .ifPresent(user -> response.setAuthorUsername(user.getUsername()));

        // Set permissions
        response.setCanEdit(comment.getAuthorId().equals(currentUserId));
        response.setCanDelete(comment.getAuthorId().equals(currentUserId) || groupCreatorId.equals(currentUserId));

        return response;
    }
}