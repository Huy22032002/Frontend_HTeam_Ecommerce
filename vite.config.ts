import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  base: process.env.VITE_BAE_PATH || "/Frontend_HTeam_Ecommerce",
=======
  server: {
    port: 5173,
  },
>>>>>>> dev
});
