"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import useSWR from "swr"

interface User {
  id: number
  email: string
  full_name: string
  phone: string | null
  role: "guest" | "host" | "admin"
  avatar_url: string | null
  is_verified: boolean
  verification_status: "pending" | "approved" | "rejected"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => void
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  phone: string
  role: "guest" | "host"
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR<{ user: User | null }>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  })

  const user = data?.user || null

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "login_failed" }
      }

      await mutate()
      return { success: true }
    } catch {
      return { success: false, error: "network_error" }
    }
  }, [mutate])

  const register = useCallback(async (data: RegisterData) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        return { success: false, error: result.error || "register_failed" }
      }

      await mutate()
      return { success: true }
    } catch {
      return { success: false, error: "network_error" }
    }
  }, [mutate])

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    await mutate({ user: null }, false)
  }, [mutate])

  const refreshUser = useCallback(() => {
    mutate()
  }, [mutate])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
