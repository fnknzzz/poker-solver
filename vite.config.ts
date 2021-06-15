import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
import ViteRsw from 'vite-plugin-rsw'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
    ViteRsw({
      crates: ['poker-solver']
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  base: '/poker-solver/'
})
