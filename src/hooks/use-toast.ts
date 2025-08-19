// src/hooks/use-toast.ts

import * as React from "react"

// Toast types
export type ToastVariant = "default" | "destructive"

export type ToastAction = {
  altText: string
  onClick: () => void
}

export type ToasterToast = {
  id: string
  open?: boolean
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  onOpenChange?: (open: boolean) => void
  action?: ToastAction    // <-- Added
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 3000

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export type ToastInput = Omit<Partial<ToasterToast>, "id"> & {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: ToastAction        // <-- Added
}

type ActionType = typeof actionTypes

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: string }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: string }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string, duration?: number) => {
  if (toastTimeouts.has(toastId)) return
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({ type: actionTypes.REMOVE_TOAST, toastId })
  }, duration ?? TOAST_REMOVE_DELAY)
  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) }
    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map(t => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }
    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action
      if (toastId) {
        const t = state.toasts.find(t => t.id === toastId)
        addToRemoveQueue(toastId, t?.duration)
      } else {
        state.toasts.forEach(t => addToRemoveQueue(t.id, t.duration))
      }
      return {
        ...state,
        toasts: state.toasts.map(t =>
          toastId === undefined || t.id === toastId ? { ...t, open: false } : t
        ),
      }
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId === undefined) {
        return { ...state, toasts: [] }
      }
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.toastId) }
    default:
      return state
  }
}

let memoryState: State = { toasts: [] }
const listeners: Array<(state: State) => void> = []

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach(listener => listener(memoryState))
}

export function toast(props: ToastInput) {
  const id = genId()
  const update = (updateProps: Partial<ToasterToast>) =>
    dispatch({ type: actionTypes.UPDATE_TOAST, toast: { ...updateProps, id } })
  const dismiss = () => dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ADD_TOAST,
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: open => {
        if (!open) dismiss()
      },
    },
  })

  return { id, dismiss, update }
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)
  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const idx = listeners.indexOf(setState)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])
  return {
    ...state,
    show: (opts: ToastInput) => toast(opts),
    toast, // raw
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.DISMISS_TOAST, toastId }),
  }
}
