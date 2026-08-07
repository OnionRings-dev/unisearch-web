export interface Collection {
  name: string;
  alias: string;
}

export interface StudentProfile {
  degree_program: string | null;
  degree_class: string | null;
  enrollment_year: number | null;
  degree_type: string | null;
  campus: string | null;
}

export interface RefreshResponse {
  access_token: string;
  user_id: number;
  email: string;
}

export interface AuthState {
  token: string;
  userId: number;
  email: string;
}

export interface GoogleLoginResponse {
  url: string;
}

export interface ApiError {
  detail?: string;
  error?: string;
}
