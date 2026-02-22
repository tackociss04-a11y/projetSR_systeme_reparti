export interface Service {
    id: number;
    title: string;
    description: string;
    imageUrl?: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}