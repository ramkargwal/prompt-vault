import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function syncRootPromptsPlugin() {
  const syncFile = () => {
    const rootPrompts = path.resolve(__dirname, 'prompts.json');
    const publicDir = path.resolve(__dirname, 'public');
    const publicPrompts = path.resolve(publicDir, 'prompts.json');
    if (fs.existsSync(rootPrompts)) {
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, {recursive: true});
      }
      fs.copyFileSync(rootPrompts, publicPrompts);
    }
  };

  return {
    name: 'sync-root-prompts-json',
    buildStart() {
      syncFile();
    },
    configureServer() {
      syncFile();
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [syncRootPromptsPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
