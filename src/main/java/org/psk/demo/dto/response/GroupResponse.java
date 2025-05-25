package org.psk.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private UserDto creator;
    private List<UserDto> members;
    private int memberCount;
    private boolean success;
    private String message;

    // Constructor for successful response
    public GroupResponse(Long id, String name, String description, LocalDateTime createdAt,
                         UserDto creator, List<UserDto> members, int memberCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.creator = creator;
        this.members = members;
        this.memberCount = memberCount;
        this.success = true;
    }

    // Constructor for error response
    public GroupResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Long id;
        private String username;
    }
}