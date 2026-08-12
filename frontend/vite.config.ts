import { defineConfig } from 'vite';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'pages/index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        books: resolve(__dirname, 'pages/books.html'),
        devices: resolve(__dirname, 'pages/devices.html'),
        loan_book: resolve(__dirname, 'pages/loan_book.html'),
        loan_device: resolve(__dirname, 'pages/loan_device.html'),
        apprentices: resolve(__dirname, 'pages/apprentices.html'),
        create_user: resolve(__dirname, 'pages/create_user.html'),
      },
    },
  },
});
