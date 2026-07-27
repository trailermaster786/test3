import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  liter: number;
  quantity: number;
  image?: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  orderId?: string;
  createdAt: string;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Navigation
  currentPortal: 'login' | 'customer' | 'admin' | 'driver';
  currentPage: string;
  setPortal: (portal: 'login' | 'customer' | 'admin' | 'driver') => void;
  setPage: (page: string) => void;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;

  // Notifications
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  unreadCount: () => number;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => {
    set({ user: null, isAuthenticated: false, currentPortal: 'login', currentPage: '' });
    fetch('/api/auth/logout', { method: 'POST' });
  },

  // Navigation
  currentPortal: 'login',
  currentPage: '',
  setPortal: (currentPortal) => set({ currentPortal, currentPage: '' }),
  setPage: (currentPage) => set({ currentPage }),

  // Cart
  cart: [],
  addToCart: (item) => {
    const { cart } = get();
    const existing = cart.find((i) => i.id === item.id);
    if (existing) {
      set({
        cart: cart.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ cart: [...cart, { ...item, quantity: 1 }] });
    }
  },
  removeFromCart: (id) => set({ cart: get().cart.filter((i) => i.id !== id) }),
  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      set({ cart: get().cart.filter((i) => i.id !== id) });
    } else {
      set({
        cart: get().cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
      });
    }
  },
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  getCartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),

  // Notifications
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  addNotification: (notification) =>
    set({ notifications: [notification, ...get().notifications] }),
  markNotificationRead: (id) =>
    set({
      notifications: get().notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }),
  unreadCount: () => get().notifications.filter((n) => !n.isRead).length,
}));
