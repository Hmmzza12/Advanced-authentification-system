package com.auth.backend.config;

import com.auth.backend.security.AuthEntryPointJwt;
import com.auth.backend.security.JwtAuthenticationFilter;
import com.auth.backend.security.UserDetailsServiceImpl;
import com.auth.backend.security.oauth2.CustomAuthorizationRequestResolver;
import com.auth.backend.security.oauth2.CustomOAuth2UserService;
import com.auth.backend.security.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.auth.backend.security.oauth2.OAuth2AuthenticationFailureHandler;
import com.auth.backend.security.oauth2.OAuth2AuthenticationSuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final ClientRegistrationRepository clientRegistrationRepository;
    
    // OAuth2 Dependencies
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
    private final OAuth2AuthenticationFailureHandler oAuth2AuthenticationFailureHandler;
    private final HttpCookieOAuth2AuthorizationRequestRepository httpCookieOAuth2AuthorizationRequestRepository;

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configure(http))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> 
                    auth.requestMatchers(
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/auth/login"),
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/auth/signup"),
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/auth/refresh-token"),
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/auth/forgot-password"),
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/auth/reset-password"),
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/api/2fa/authenticate"),
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/oauth2/**"),
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/login/oauth2/**"),
                            new org.springframework.security.web.util.matcher.AntPathRequestMatcher("/error")
                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(customizer -> customizer
                        .baseUri("/oauth2/authorize")
                        .authorizationRequestRepository(httpCookieOAuth2AuthorizationRequestRepository)
                        .authorizationRequestResolver(new CustomAuthorizationRequestResolver(
                                clientRegistrationRepository, "/oauth2/authorize"))
                    )
                    .redirectionEndpoint(customizer -> customizer
                        .baseUri("/oauth2/callback/*")
                    )
                    .userInfoEndpoint(customizer -> customizer
                        .userService(customOAuth2UserService)
                    )
                    .successHandler(oAuth2AuthenticationSuccessHandler)
                    .failureHandler(oAuth2AuthenticationFailureHandler)
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
