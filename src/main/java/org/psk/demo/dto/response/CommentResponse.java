package org.psk.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private Long groupId;
    private Long authorId;
    private String authorUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean isEdited;
    private boolean canEdit; // Whether current user can edit this comment
    private boolean canDelete; // Whether current user can delete this comment
}