import request from "../utils/request"

export const getGitInfo = <T>() => request<T>({ url: '/get_git_token' })

export const setGitInfo = 
  (data: { username: string, token: string }) => request({ url: '/set_git_token', method: 'post', data })

export const createProject = 
  (data: { projectName: string, targetUrl: string }) => request({ url: '/create_build_project', method: 'post', data })

export const getProjects = <T>() => request<T>({ url: '/get_projects' })

export const deleteProject = 
  (projectName: string) => request({ url: `/delete_project?projectName=${projectName}`, method: 'delete' })

export const getShellContent = 
  <T>(projectName: string) => request<T>({ url: `/get_shell_content?projectName=${projectName}`, method: 'post' })

export const build = 
  <T>(data: { shell: boolean, install: boolean, projectName: string, [key: string]: any }) => request<T>({ url: '/build', method: 'post', data })

export const getHistroys = <T>() => request<T>({ url: '/get_history' })

export const getLog = 
  <T>(projectName: string) => request<T>({ url: `/get_log?projectName=${projectName}` })

export const download = 
  <T>(projectName: string) => request<T>({ url: `/download?projectName=${projectName}`, method: 'post', responseType: 'blob' })

export const publish = 
  <T>(data: any) => request<T>({ url: '/publish', method: 'post', data })

export const getPublishList = <T>() => request<T>({ url: '/get_publish_list', method: 'post' })

export const savePublishList = 
  <T>(data: any) => request<T>({ url: '/create_publish', method: 'post', data })

export const deletePublis = 
  <T>(id: any) => request<T>({ url: `/delete_publish?id=${id}`, method: 'delete' })

export const getPublishById = 
  <T>(id: any) => request<T>({ url: `/get_publish_item_by_id?id=${id}` })

export const deleteHistory = 
  <T>(projects: any) => request<T>({ url: '/delete_as_history', method: 'post', data: { projects } })

export const getSysConfig = <T>() => request<T>({ url: '/get_sys_config' })

export const setSysConfig = 
  (data: { concurrentCount: string, simuCount: string }) => request({ url: '/set_sys_config', method: 'post', data })

export const getWsConfig = <T>() => request<T>({ url: '/get_ws_config' })

export const setWsConfig = 
  (data: { wsUrl: string }) => request({ url: '/set_ws_config', method: 'post', data })

export const getWsLog = 
  <T>(projectName: string) => request<T>({ url: `/get_ws_log?projectName=${projectName}` })

export const delTagByName = 
  <T>(tagName: string) => request<T>({ url: `/delete_tags?tagName=${tagName}`, method: 'delete' })

export const getTags = 
  <T>(tagName: string) => request<T>({ url: `/get_tags?tagName=${tagName}`, method: 'post' })