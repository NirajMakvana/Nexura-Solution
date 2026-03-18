import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            setAuth: (token, user) => set({
                token,
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null
            }),

            login: (token, user) => {
                set({
                    token,
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null
                })
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                })
                // Clear other storage items
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                localStorage.removeItem('currentEmployee')
                localStorage.removeItem('employeeAuthenticated')
                sessionStorage.removeItem('adminAuthenticated')
            },

            setLoading: (loading) => set({ isLoading: loading }),
            setError: (error) => set({ error: error, isLoading: false }),
            updateUser: (userData) => set((state) => ({
                user: state.user ? { ...state.user, ...userData } : userData
            }))
        }),
        {
            name: 'nexura-auth', // This matches what api.js looks for
        }
    )
)
