'use client'

import React from 'react'
import { ToastProvider } from './Toast'

/**
 * ✅ Responsible for rendering React Native toasts
 * Place this component once in your app root (App.tsx / Layout.tsx)
 */
export function Toaster() {
  return <ToastProvider />
}
