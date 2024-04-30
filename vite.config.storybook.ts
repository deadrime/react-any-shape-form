/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts';
import path from 'path';
import terser from '@rollup/plugin-terser';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    dts({
      insertTypesEntry: true,
    }),
  ],
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
  esbuild: {
    jsx: 'automatic',
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'bundle',
      formats: ['es'],
      fileName: (format) => `bundle.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      treeshake: 'smallest',
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      plugins: [terser({
        sourceMap: true,
        format: {
          comments: false,         
        },
        mangle: true,
        compress: true,
      }) as any]
    },
  },
})
