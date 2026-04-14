
export const ROUTES = {

  HOME:              '/',
  PRODUCTS:          '/products',
  PRODUCT_DETAIL:    (id: string) => `/products/${id}`,


  PRODUCT_NEW:       '/products/new',
  PRODUCT_EDIT:      (id: string) => `/products/${id}/edit`,

  CHATS:             '/chats',
  CHAT_ROOM:         (chatId: string) => `/chats/${chatId}`,

  PROFILE:           '/profile',
  PROFILE_PUBLIC:    (userId: string) => `/profile/${userId}`,
  PROFILE_SETTINGS:  '/profile/settings',


  LOGIN:             '/login',
  REGISTER:          '/register',
  VERIFY_EMAIL:      '/verify-email',


  AUTH_CALLBACK:     '/api/auth/callback',
  STORAGE_UPLOAD:    '/api/storage/upload',
} as const
