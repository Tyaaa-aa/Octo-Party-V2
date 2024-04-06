<script setup lang="ts">
useSeoMeta({
  title: 'Octo.Party',
  ogTitle: 'Octo.Party | Multi-Stream',
  twitterTitle: 'Octo.Party | Multi-Stream',
  twitterDescription: 'The straightforward solution for watching multiple Twitch streams with friends. With Octo Party, you can easily create lists of Twitch streams to watch simultaneously, all in one place.',
  description: 'The straightforward solution for watching multiple Twitch streams with friends. With Octo Party, you can easily create lists of Twitch streams to watch simultaneously, all in one place.',
  ogDescription: 'The straightforward solution for watching multiple Twitch streams with friends. With Octo Party, you can easily create lists of Twitch streams to watch simultaneously, all in one place.',
  ogImage: '/favicon.svg',
  twitterImage: '/favicon.svg',
  ogUrl: 'https://octo.party',
  twitterCard: 'summary'
})

useHead({
  htmlAttrs: {
    lang: 'en'
  },
  link: [
    {
      rel: 'icon',
      type: 'image/svg',
      href: '/favicon.svg'
    }
  ],
  bodyAttrs: {
    class: `dark`
  }
})

</script>

<template>
  <div>
    <NuxtPage />
  </div>
</template>
