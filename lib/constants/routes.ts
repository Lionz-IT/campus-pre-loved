// ─── App Routes (hindari magic strings di seluruh codebase) ─────────────────
export const ROUTES = {
  // Public
  HOME:              '/',
  PRODUCTS:          '/products',
  PRODUCT_DETAIL:    (id: string) => `/products/${id}`,

  // Protected
  PRODUCT_NEW:       '/products/new',
  PRODUCT_EDIT:      (id: string) => `/products/${id}/edit`,

  CHATS:             '/chats',
  CHAT_ROOM:         (chatId: string) => `/chats/${chatId}`,

  PROFILE:           '/profile',
  PROFILE_PUBLIC:    (userId: string) => `/profile/${userId}`,
  PROFILE_SETTINGS:  '/profile/settings',

  // Auth
  LOGIN:             '/login',
  REGISTER:          '/register',
  VERIFY_EMAIL:      '/verify-email',

  // API
  AUTH_CALLBACK:     '/api/auth/callback',
  STORAGE_UPLOAD:    '/api/storage/upload',
} as const
