import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Use relative paths for Chrome extension
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
      // Exclude the Life-OS-Productivity-App folder from build
      external: (id) => {
        return id.includes('Life-OS-Productivity-App') || id.includes('unpkg.com');
      },
    },
    emptyOutDir: true,
    // Ensure all dependencies are bundled
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  // Prevent loading external resources
  server: {
    fs: {
      // Restrict file system access
      strict: true,
      // Deny access to Life-OS-Productivity-App folder
      deny: ['**/Life-OS-Productivity-App/**'],
    },
  },
  // Resolve configuration
  resolve: {
    alias: {
      // Ensure we don't accidentally import from Life-OS-Productivity-App
    },
  },
});
