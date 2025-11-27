import "clsx";
import { w as writable } from "./index.js";
import "vite-plugin-node-polyfills/shims/global";
const initialToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
const initialUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
const tokenStore = writable(initialToken);
const userStore = writable(initialUser);
export {
  tokenStore as t,
  userStore as u
};
