import { defineComponent, reactive, watch, Fragment } from 'vue'
import { Router } from './modules/router'

export default defineComponent({
  setup() {

    const state = reactive({
      Page: null as any
    })

    watch(() => Router.route.path, async (path) => {

      if (!path) { // 如果路由路径为 / 给个默认路径
        path = '/list'
      }

      if (path.charAt(0) === '/') {
        path = path.slice(1)
      }

      const Components = Object.values(await import('../views/' + path)) as any[]
      state.Page = Components.map((Component, index) => (
        <Fragment key={index}>
          <Component />
        </Fragment>
      ))
    }, { immediate: true })

    return () =>
      <div class="app-navigator">
        {state.Page}
      </div>
  }
})