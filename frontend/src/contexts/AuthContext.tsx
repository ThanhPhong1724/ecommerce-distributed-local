// src/contexts/AuthContext.tsx
import React, { createContext, useReducer, useContext, useEffect } from 'react';

// 1. Định nghĩa kiểu dữ liệu cho trạng thái Auth
interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string } | null; // Lưu thông tin user cơ bản
  token: string | null;
}

// 2. Định nghĩa các hành động (Actions) có thể thay đổi trạng thái
type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: { id: string; email: string } } }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_USER_FROM_STORAGE'; payload: { token: string; user: { id: string; email: string } } }; // Để load lại khi refresh

// 3. Trạng thái khởi tạo ban đầu
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

// 4. Reducer: Hàm xử lý các action và cập nhật state
// (Giống như cách bạn xử lý state trong Redux)
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('accessToken', action.payload.token); // Lưu token vào localStorage
      localStorage.setItem('userInfo', JSON.stringify(action.payload.user));
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
      };
    case 'LOGOUT':
      localStorage.removeItem('accessToken'); // Xóa token khỏi localStorage
      localStorage.removeItem('userInfo');
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
      };
    case 'LOAD_USER_FROM_STORAGE':
       return {
            ...state,
            isAuthenticated: true,
            token: action.payload.token,
            user: action.payload.user,
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

// 6. Tạo Provider Component: Component này sẽ bao bọc App
// và cung cấp Context cho các component con
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user từ localStorage khi component mount lần đầu
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userInfo = localStorage.getItem('userInfo');
    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
         dispatch({ type: 'LOAD_USER_FROM_STORAGE', payload: { token, user } });
      } catch (error) {
         console.error("Failed to parse user info from storage", error);
         // Có thể xóa storage bị lỗi ở đây
         localStorage.removeItem('accessToken');
         localStorage.removeItem('userInfo');
      }
    }
  }, []); // Chạy 1 lần khi mount

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