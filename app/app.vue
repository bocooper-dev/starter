<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nuxt UI Pro - Starter'
const description = 'Nuxt UI Pro is a collection of premium Vue components built on top of Nuxt UI to create beautiful & responsive Nuxt applications in minutes.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: 'https://ui-pro-starter.nuxt.dev/social-card.png',
  twitterImage: 'https://ui-pro-starter.nuxt.dev/social-card.png',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <UButton
            to="/"
            variant="ghost"
            class="text-xl font-bold text-gray-900 dark:text-white"
            icon="i-lucide-bar-chart"
          >
            MPC Dashboard
          </UButton>
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          to="/films"
          icon="i-lucide-film"
          variant="ghost"
        >
          Films
        </UButton>
        <UButton
          to="/actors"
          icon="i-lucide-users"
          variant="ghost"
        >
          Actors
        </UButton>
        <UButton
          to="/analytics"
          icon="i-lucide-bar-chart"
          variant="ghost"
        >
          Analytics
        </UButton>
        <UButton
          to="/generate"
          icon="i-lucide-star"
          variant="ghost"
        >
          Generate
        </UButton>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain class="pb-18">
      <NuxtPage />
    </UMain>

    <USeparator icon="i-simple-icons-nuxtdotjs" />

    <UFooter>
      <template #left>
        <p class="text-sm text-(--ui-text-muted)">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #center>
        <p class="text-sm text-(--ui-text-muted)">
          MPC Dashboard for Pagila Database &copy; {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <UButton
          to="https://github.com/nuxt-ui-pro/starter"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          color="neutral"
          variant="ghost"
        />
      </template>

    </UFooter>
  </UApp>
</template>
