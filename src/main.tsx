import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFCM } from "./lib/sw-registration";
import { requestNotificationPermission } from "./lib/fcm";

// Initialize FCM and service worker
initFCM().catch(console.error);

// Request notification permission
requestNotificationPermission().catch(console.error);

createRoot(document.getElementById("root")!).render(<App />);
