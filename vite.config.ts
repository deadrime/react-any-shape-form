import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
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
    sourcemap: true,
    minify: 'esbuild',
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
    },
  },
})
