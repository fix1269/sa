// =====================================================================
// Rofof (رفوف) — Central Configuration File
// All app metadata, client profile, security keys, and Firebase config.
// Every component reads from this single source of truth.
// =====================================================================

export const shopConfig = {
  appName: "Rofof (رفوف)",
  appVersion: "1.0.0",
  developer: {
    name: "Rofof Systems",
    email: "support@rofof.app",
    website: "https://rofof.app",
    copyright: "© 2026 Rofof Systems. All rights reserved.",
  },
  clientShop: {
    name: "سوبر ماركت الأمانة",
    type: "سوبر ماركت",
    phone: "01xxxxxxxxx",
    address: "القاهرة، مصر",
    currency: "ج.م",
  },
  security: {
    // General app password — verified at entry screen for daily operational logs
    generalPassword: "12345",
    // Administrative manager key — safeguards managerial sections
    managerKey: "123",
    // Recovery email node tied to Firebase for password recovery
    recoveryEmail: "owner@rofof.app",
  },
  firebase: {
     apiKey: "AIzaSyD5WnYHJ14vHe7651Zr9yMoBxmIjxzMCjk",
  authDomain: "rofof-a7e5b.firebaseapp.com",
  projectId: "rofof-a7e5b",
  storageBucket: "rofof-a7e5b.firebasestorage.app",
  messagingSenderId: "427651994831",
  appId: "1:427651994831:web:cf2c273cb04011985313ba",
  measurementId: "G-9BP19G75CY"
  },
  // Global sync switch default — when ON, all operations affect inventory & sales
  autoSync: true,
};

export default shopConfig;
