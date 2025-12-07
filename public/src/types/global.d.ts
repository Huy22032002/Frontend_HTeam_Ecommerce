export {};

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (params: any) => void;
      renderButton: (element: HTMLElement | null, options: any) => void;
      prompt: () => void;
    };
  };
}

declare global {
  interface Window {
    google: GoogleIdentity;
    FB: any;
  }
}
