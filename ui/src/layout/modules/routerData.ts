import { reactive } from "vue"

import { Router } from './router'

interface IRoutesData {
  name: string
  childrens: IRoutesDataChilds[]
}

interface IRoutesDataChilds {
  name: string
  title?: string
  page: string
  complete?: boolean
}


const routes: IRoutesData[] = [
  {
    name: '项目管理',
    childrens: [
      { name: 'Project List', title: '项目列表', page: '/list'},
      // { name: 'Build', title: '构建项目', page: '/build'},
      { name: 'Histroy', title: '历史', page: '/histroy'},
      { name: 'Publish Config', title: '推送列表', page: '/publishConfig'},

    ]
  },
  {
    name: '设置',
    childrens: [
      { name: 'git-token', title: 'Git Token', page: '/gitToken'},
    ]
  }
]

export const Menu = (() => {
  const state = reactive({
    data: routes,
    openMenu: (menu: IRoutesDataChilds) => Router.go(menu.page)
  })

  return state
})()