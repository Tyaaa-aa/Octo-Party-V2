export default defineNuxtPlugin(async (nuxtApp) => {
    if (process.client) {
        await new Promise((resolve) => {
            const script = document.createElement('script')
            script.src = 'https://embed.twitch.tv/embed/v1.js'
            script.onload = resolve
            document.body.appendChild(script)
        })
    }
})