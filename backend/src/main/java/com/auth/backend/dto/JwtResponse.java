package com.auth.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String refreshToken;
    private Long id;
    private String username;
    private String email;
    private boolean is2faEnabled;
    private boolean requires2fa;

    public JwtResponse(String token, String refreshToken, Long id, String username, String email, boolean is2faEnabled, boolean requires2fa) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.is2faEnabled = is2faEnabled;
        this.requires2fa = requires2fa;
    }
}
