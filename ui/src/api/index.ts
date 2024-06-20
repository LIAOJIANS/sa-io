import request from "../utils/request"

export const getGitInfo = <T>() => request<T>({ url: '/get_git_token' })