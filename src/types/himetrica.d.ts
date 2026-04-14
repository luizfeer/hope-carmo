/** Himetrica — carregado por `next/script` em `app/layout.tsx`. Só usar em código cliente. */
export {};

declare global {
  interface Window {
    himetrica?: {
      track: (
        eventName: string,
        properties?: Record<string, unknown>,
      ) => void;
      identify: (payload: {
        name?: string;
        email?: string;
        metadata?: Record<string, unknown>;
      }) => void;
    };
  }
}
