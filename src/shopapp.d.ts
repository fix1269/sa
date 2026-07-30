declare module "@/../shopapp.js" {
  export interface ShopConfig {
    appName: string;
    appVersion: string;
    developer: {
      name: string;
      email: string;
      website: string;
      copyright: string;
    };
    clientShop: {
      name: string;
      type: string;
      phone: string;
      address: string;
      currency: string;
    };
    security: {
      generalPassword: string;
      managerKey: string;
      recoveryEmail: string;
    };
    firebase: {
      apiKey: string;
      authDomain: string;
      projectId: string;
      storageBucket: string;
      messagingSenderId: string;
      appId: string;
    };
    autoSync: boolean;
  }
  export const shopConfig: ShopConfig;
  export default shopConfig;
}
