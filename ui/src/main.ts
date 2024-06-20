import App from './app'
import { createApp } from 'vue'
import ElementUI, { size, locale } from './plugin/elementUI'

const app = createApp(App)

app
  .use(ElementUI, {
    size,
    locale
  })
  .mount('#app')