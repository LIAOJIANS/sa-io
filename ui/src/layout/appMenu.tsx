import { defineComponent, Fragment } from 'vue'

import { Menu } from './modules/routerData'


export default defineComponent({
  setup() {


    return () => (
      <div class="app-menu">
        <div class="app-menu-scroll">
          {
            Menu.data.map(group => <Fragment key={group.name} >
              <div class="app-menu-group" key={ `group_${group.name}` }>
                <span>{ group.name }</span>
              </div>

              {
                group.childrens.map(menu => (
                  <div class="app-menu-item" key={ `item_${ menu.name }`}  onClick={ () => Menu.openMenu(menu) } >
                    <span>{ menu.name }</span>
                    <span>{ menu.title }</span>
                  </div>
                ))
              }
            </Fragment>)
          }
        </div>
      </div>
    )
  }
})