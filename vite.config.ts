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
      exclude: /\.stories\.(t|j)sx?$/,
      jsxRuntime: 'classic',
    }),
    dts({
      insertTypesEntry: true,
    }),
  ],
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
  build: {
    sourcemap: false,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        core: path.resolve(__dirname, 'src/core.ts'),
        array: path.resolve(__dirname, 'src/array.ts'),
        'addons/array': path.resolve(__dirname, 'src/addons/array/index.ts'),
        'addons/nestedForm': path.resolve(__dirname, 'src/addons/nestedForm/index.ts'),
        'addons/zodSchema': path.resolve(__dirname, 'src/addons/zodSchema/index.ts'),
        'addons/yupSchema': path.resolve(__dirname, 'src/addons/yupSchema/index.ts'),
        'addons/valibotSchema': path.resolve(__dirname, 'src/addons/valibotSchema/index.ts'),
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'zod', 'yup', 'valibot'],
      treeshake: 'smallest',
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: (chunk) => `${chunk.name}.es.js`,
        chunkFileNames: '[name].es.js',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
      plugins: [terser({
        sourceMap: false,
        format: {
          comments: false,
        },
        mangle: true,
      }) as any]
    },
  },
})
