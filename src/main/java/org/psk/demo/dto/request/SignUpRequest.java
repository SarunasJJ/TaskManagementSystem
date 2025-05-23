package org.psk.demo.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignUpRequest {
    @NotBlank(message = "Username is required")
    @Size(min=3, max = 20, message = "Username must be between 3 and 20 characters long!")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min=8, message = "Password must be atleast 8 characters long!")
    private String password;

    @NotBlank(message = "Confirm your password")
    private String confirmPassword;
}
