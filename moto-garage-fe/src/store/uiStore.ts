import { create } from 'zustand'

interface ModalState {
  isOpen: boolean
  title?: string
  content?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClose?: () => void
}

interface ToastState {
  id: string
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface UIState {
  // Loading
  isLoading: boolean
  loadingText?: string

  // Modal
  modal: ModalState

  // Toast/Notifications
  toasts: ToastState[]

  // Sidebar
  isSidebarOpen: boolean

  // Actions
  setLoading: (loading: boolean, text?: string) => void
  setModal: (modal: Partial<ModalState>) => void
  closeModal: () => void
  addToast: (toast: Omit<ToastState, 'id'>) => void
  removeToast: (id: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set, get) => ({
  isLoading: false,
  loadingText: undefined,

  modal: {
    isOpen: false,
    title: undefined,
    content: undefined,
    size: 'md',
    onClose: undefined
  },

  toasts: [],

  isSidebarOpen: false,

  setLoading: (loading: boolean, text?: string) => {
    set({ isLoading: loading, loadingText: text })
  },

  setModal: (modal: Partial<ModalState>) => {
    set((state) => ({
      modal: {
        ...state.modal,
        ...modal,
        isOpen: modal.isOpen !== undefined ? modal.isOpen : true
      }
    }))
  },

  closeModal: () => {
    const { modal } = get()
    if (modal.onClose) {
      modal.onClose()
    }
    set({
      modal: {
        isOpen: false,
        title: undefined,
        content: undefined,
        size: 'md',
        onClose: undefined
      }
    })
  },

  addToast: (toast: Omit<ToastState, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }))

    // Auto-remove toast after duration
    const duration = toast.duration || 3000
    setTimeout(() => {
      get().removeToast(id)
    }, duration)
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  },

  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  setSidebarOpen: (open: boolean) => {
    set({ isSidebarOpen: open })
  }
}))
