import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Demo date utilities
// Reads an ISO string from localStorage under key 'demoDate'. If present, returns that Date.
// Otherwise returns real current time. Useful to simulate "now" in demos.
export function getNow() {
  try {
    const iso = localStorage.getItem('demoDate')
    if (iso) {
      const d = new Date(iso)
      if (!Number.isNaN(d.getTime())) return d
    }
  } catch (e) {
    // ignore storage errors and fall back to real time
  }
  return new Date()
}

export function setDemoDate(dateOrNull) {
  try {
    if (!dateOrNull) {
      localStorage.removeItem('demoDate')
      return
    }
    const iso = typeof dateOrNull === 'string' ? dateOrNull : new Date(dateOrNull).toISOString()
    localStorage.setItem('demoDate', iso)
  } catch (e) {
    // ignore storage errors in demo
  }
}
