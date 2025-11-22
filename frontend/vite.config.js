import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["@supabase/supabase-js"], // force Vite to prebundle Supabase
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true, // ensure mixed modules work properly
    },
  },
});
