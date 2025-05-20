// src/contexts/AuthContext.tsx
import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';

// Thêm interface User
interface User {
  id: string;
  email: string;
  role: UserRole; // <<< THÊM ROLE
  // Thêm các trường khác nếu cần
}

// Cập nhật AuthState
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean; // Thêm loading state
}

// Cập nhật initialState
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true // Bắt đầu với loading = true
};

export enum UserRole { // <<< Export enum này nếu chưa
  USER = 'user',
  ADMIN = 'admin',
}

// Thêm action mới
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_USER_FROM_STORAGE'; payload: { token: string; user: User } }
  | { type: 'AUTH_ERROR' }; // Thêm action mới

// Cập nhật reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('accessToken', action.payload.token);
      localStorage.setItem('userInfo', JSON.stringify(action.payload.user));
      
      // Kiểm tra và xử lý redirect sau login
      const redirectPath = localStorage.getItem('redirectPath');
      if (redirectPath) {
        localStorage.removeItem('redirectPath');
        window.location.href = redirectPath;
      }
      
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        loading: false
      };

    case 'LOGOUT':
    case 'AUTH_ERROR':
      // Lưu path hiện tại trước khi logout
      if (window.location.pathname !== '/login') {
        localStorage.setItem('redirectPath', window.location.pathname);
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userInfo');
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false
      };

    case 'LOAD_USER_FROM_STORAGE':
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        loading: false
      };

    default:
      return state;
  }
};

// 5. Tạo Context
// Context sẽ chứa state và hàm dispatch để gửi action
interface AuthContextProps {
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
}
const AuthContext = createContext<AuthContextProps>({
  state: initialState,
  dispatch: () => null, // Hàm dispatch mặc định không làm gì cả
});

// Thêm một số helper functions trong AuthProvider
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const userInfo = localStorage.getItem('userInfo');
      
      if (token && userInfo) {
        const user = JSON.parse(userInfo);
        dispatch({ type: 'LOAD_USER_FROM_STORAGE', payload: { token, user } });
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    } catch (error) {
      console.error("Failed to load user from storage", error);
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Chỉ render children khi đã load xong initial auth state
  if (state.loading) {
    return <div>Loading...</div>; // Hoặc component loading của bạn
  }

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// 7. Tạo Custom Hook: Để dễ dàng sử dụng context trong các component khác
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};