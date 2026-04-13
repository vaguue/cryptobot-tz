declare global {
  namespace Express {
    interface Locals {
      userTgId: number;
    }
  }
}

export {};
