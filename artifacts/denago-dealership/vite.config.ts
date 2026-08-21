import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type UserConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

/**
 * `PORT` and `BASE_PATH` are supplied by the Replit runtime and are required
 * whenever a server is started (`dev` / `serve`). A production build never
 * starts a server -- on Cloudflare Workers Builds neither variable exists --
 * so `vite build` falls back to defaults instead of failing the build.
 */
const DEFAULT_PORT = 5000;
const DEFAULT_BASE_PATH = '/';

function resolvePort(isServing: boolean): number {
  const rawPort = process.env.PORT;

  if (!rawPort) {
    if (isServing) {
      throw new Error(
        'PORT environment variable is required but was not provided.',
      );
    }
    return DEFAULT_PORT;
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  return port;
}

function resolveBasePath(isServing: boolean): string {
  const basePath = process.env.BASE_PATH;

  if (!basePath) {
    if (isServing) {
      throw new Error(
        'BASE_PATH environment variable is required but was not provided.',
      );
    }
    return DEFAULT_BASE_PATH;
  }

  return basePath;
}

export default defineConfig(
  async ({ command }): Promise<UserConfig> => {
    const isServing = command === 'serve';
    const port = resolvePort(isServing);
    const basePath = resolveBasePath(isServing);

    return {
      base: basePath,
      plugins: [
        react(),
        tailwindcss(),
        runtimeErrorOverlay(),
        ...(process.env.NODE_ENV !== 'production' && process.env.REPL_ID !== undefined
          ? [
              await import('@replit/vite-plugin-cartographer').then((m) =>
                m.cartographer({
                  root: path.resolve(import.meta.dirname, '..'),
                }),
              ),
              await import('@replit/vite-plugin-dev-banner').then((m) => m.devBanner()),
            ]
          : []),
      ],
      resolve: {
        alias: {
          '@': path.resolve(import.meta.dirname, 'src'),
          '@assets': path.resolve(import.meta.dirname, '..', '..', 'attached_assets'),
        },
        dedupe: ['react', 'react-dom'],
      },
      root: path.resolve(import.meta.dirname),
      build: {
        outDir: path.resolve(import.meta.dirname, 'dist/public'),
        emptyOutDir: true,
      },
      server: {
        port,
        strictPort: true,
        host: '0.0.0.0',
        allowedHosts: true,
        fs: {
          strict: true,
        },
      },
      preview: {
        port,
        host: '0.0.0.0',
        allowedHosts: true,
      },
    };
  },
);
