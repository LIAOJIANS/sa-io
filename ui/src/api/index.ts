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
  (projectName: string) => request({ url: `/download?projectName=${projectName}`, method: 'post', responseType: 'blob' })