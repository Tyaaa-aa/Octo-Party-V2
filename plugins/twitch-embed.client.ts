export default defineNuxtPlugin((nuxtApp) => {
    if (process.client) {
        const script = document.createElement('script');
        script.src = 'https://embed.twitch.tv/embed/v1.js';
        document.body.appendChild(script);
    }
})
