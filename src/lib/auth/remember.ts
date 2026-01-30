import { AsyncLocalStorage } from "node:async_hooks";

type RememberStore = {
  rememberMe: boolean;
};

const rememberStorage = new AsyncLocalStorage<RememberStore>();

export function setRememberMe(rememberMe: boolean) {
  rememberStorage.enterWith({ rememberMe });
}

export function getRememberMe() {
  return rememberStorage.getStore()?.rememberMe;
}

