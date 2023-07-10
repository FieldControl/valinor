import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import vuetify from "vite-plugin-vuetify"
import {fileURLToPath, URL} from 'node:url'

export default defineConfig({
  plugins: [vue(), vuetify()],
  test: {
    coverage: {
      reporter: ['text', 'lcov'],
      provider: 'c8'
    },
    environment: "jsdom",
    deps: {
      inline: ["vuetify"],
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ],
  },
});
