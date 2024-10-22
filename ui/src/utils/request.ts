import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig, Method } from 'axios'
import { ElMessage } from 'element-plus'

export interface IResult {
  code: number,
  message?: String,
  data?: any,
  [key: string]: any
}

export interface IRequest {
  url: string,
  method?: Method,
  params?: any,
  data?: Record<string, any>,
  [key: string]: any
}

export interface CreateAxiosOptions extends AxiosRequestConfig {
  prefixUrl?: string;
  [key: string]: any
}

export type IRequestCallback<T> = (Axios: T) => Promise<AxiosInstance>

export type AxiosReturnData<T> = Omit<AxiosResponse, 'data'> & {
  data: {
    code: string | number,
    content: T,
    message: string
  }
} 

class Axios<IRequest, IResult> {
  private axiosInstance: AxiosInstance

  constructor(axiosConfig: CreateAxiosOptions) {
    this.axiosInstance = axios.create(axiosConfig)
    this.initAxios()
  }

  private initAxios() {
    this.interceptorsRequest()
    this.interceptorsResponse()
  }

  private interceptorsRequest() {
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig,) => {
        config.headers!['Content-Type'] = 'application/json;charset=UTF-8'
        
        return config
      },
      (error: Error) => {

        ElMessage({
          message: error.message || 'error!',
          type: 'error'
        })

        return Promise.reject(error)
      }
    )
  }

  private interceptorsResponse() {
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<any>) => {
        if(response.data.code == 200 || response.status === 200) {
          return response
        } else {
          
          ElMessage({ message: response.data.msg, type: 'error' })
          return Promise.reject(response)
        }
      },
      (error: any) => {
        return Promise.reject(error)
      }
    )
  }

  request<T>(options: IRequest & AxiosRequestConfig): Promise<T> {
    return new Promise((resolve, reject) => {
      this.axiosInstance.request<any, AxiosResponse<IResult>>(options)
        .then((res: AxiosResponse<IResult>) => {
          resolve((res as any) as Promise<T>)
        }).catch((e: Error) => {
          reject(e)
        })
    })
  }
}

  function request<T>(options: IRequest): Promise<AxiosReturnData<T>> {
    if(!options.method) {
      options.method = 'get'
    }
    return new Axios<IRequest, IResult>(
      {
        timeout: 30000,
        withCredentials: true,
        baseURL: process.env.NODE_ENV === 'development' ? '/api' : '/',
        headers: { 'Cache-Control': 'no-cache' }
      }
    ).request<AxiosReturnData<T>>(options)
  }

export default request