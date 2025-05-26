package org.psk.demo.services;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
public class UserContextService {

    public Long getCurrentUserId() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return null;

        String userIdHeader = request.getHeader("User-Id");
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            try {
                return Long.parseLong(userIdHeader);
            } catch (NumberFormatException e) {
                return null;
            }
        }

        Object userIdObj = request.getSession(false) != null ?
                request.getSession(false).getAttribute("userId") : null;

        return userIdObj instanceof Long ? (Long) userIdObj : null;
    }

    public String getCurrentUsername() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return "SYSTEM";

        String username = request.getHeader("Username");
        if (username != null && !username.isEmpty()) {
            return username;
        }

        Object usernameObj = request.getSession(false) != null ?
                request.getSession(false).getAttribute("username") : null;

        return usernameObj instanceof String ? (String) usernameObj : "UNKNOWN";
    }

    public String getCurrentUserRoles() {
        Long userId = getCurrentUserId();
        return userId != null ? "USER" : "ANONYMOUS";
    }

    public String getClientIpAddress() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return "0.0.0.0";

        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    public String getSessionId() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return null;

        return request.getSession(false) != null ?
                request.getSession(false).getId() : null;
    }

    public String getUserAgent() {
        HttpServletRequest request = getCurrentRequest();
        if (request == null) return null;

        return request.getHeader("User-Agent");
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
}