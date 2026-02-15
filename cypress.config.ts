
import { defineConfig } from 'cypress';
import { startDevServer } from '@cypress/vite-dev-server';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    // defaultCommandTimeout: 10000, 
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
  },
});
