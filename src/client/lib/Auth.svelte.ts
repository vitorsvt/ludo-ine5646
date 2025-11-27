import { writable } from 'svelte/store';

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const initialUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

export const tokenStore = writable<string | null>(initialToken);
export const userStore = writable<string | null>(initialUser)

export function saveAuth(token: string, user: string) {
    localStorage.setItem('token', token)
    tokenStore.set(token)
    localStorage.setItem('user', user)
    userStore.set(user)
}

export function clearAuth() {
    localStorage.removeItem('token')
    tokenStore.set(null)
    localStorage.removeItem('user')
    userStore.set(null)
}