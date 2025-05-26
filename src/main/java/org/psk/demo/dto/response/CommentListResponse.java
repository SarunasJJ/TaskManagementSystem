package org.psk.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentListResponse {
    private String message;
    private List<CommentResponse> comments;
    private int totalComments;
    private boolean success;
}