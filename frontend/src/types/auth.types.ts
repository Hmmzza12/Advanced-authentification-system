export interface User {
    id: number;
    username: string;
    email: string;
    is2faEnabled?: boolean;
}

export interface AuthResponse {
    token: string;
    type: string;
    refreshToken: string;
    id: number;
    username: string;
    email: string;
    is2faEnabled: boolean;
    requires2fa?: boolean;
}

export interface Setup2FAResponse {
    secret: string;
    qrCodeUrl: string;
    backupCodes: string;
}
