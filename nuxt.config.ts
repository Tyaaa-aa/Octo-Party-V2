// https://nuxt.com/docs/api/configuration/nuxt-config
import { md3 } from 'vuetify/blueprints'
export default defineNuxtConfig({
  devtools: { enabled: true },
  routeRules: {
    // prerender index route by default
    '/': { prerender: true },
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      script: [{ src: 'https://embed.twitch.tv/embed/v1.js' }],
    },
  },

  modules: [
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@invictus.codes/nuxt-vuetify',
    '@formkit/auto-animate/nuxt',
    '@vueuse/nuxt',
  ],
  piniaPersistedstate: {
    cookieOptions: {
      sameSite: 'strict',
    },
    storage: 'localStorage'
  },
  vuetify: {
    /* vuetify options */
    vuetifyOptions: {
      // @TODO: list all vuetify options
      theme: {
        defaultTheme: 'dark',
      },
      blueprint: md3,
    },
    moduleOptions: {
      /* nuxt-vuetify module options */
      treeshaking: true,
    }
  },
});
