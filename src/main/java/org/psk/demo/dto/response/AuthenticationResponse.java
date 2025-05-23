package org.psk.demo.dto.response;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthenticationResponse {
    private String message;
    private String username;
    private Long userId;
    private boolean success;
}
