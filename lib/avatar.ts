//lib\avatar.ts

export const AVATAR_STORAGE_KEY = "qubit_avatar"

export function saveAvatar(base64: string) {
  localStorage.setItem(AVATAR_STORAGE_KEY, base64)
}

export function loadAvatar(): string | null {
  return localStorage.getItem(AVATAR_STORAGE_KEY)
}

export function clearAvatar() {
  localStorage.removeItem(AVATAR_STORAGE_KEY)
}
