import { AxiosResponse } from 'axios'
import { ElMessage as Message } from 'element-plus'

function hanldDowFile(
  bas64: Blob,
  fileName: string
) {
  if ('download' in document.createElement('a')) {
    const elink = document.createElement('a')
    elink.download = fileName
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(bas64)
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href)
    document.body.removeChild(elink)
  }
}


export const download = {
  export: (
    {
      res,
      beforeDownload,
      afterDownload,
      error
    }: {
      res: AxiosResponse<any>,
      beforeDownload?: () => void,
      afterDownload?: () => void,
      error?: (e: Error) => void
    }
  ) => {
    try {
      beforeDownload?.()
      const bas64 = res.data
      const fileName = res.headers['content-disposition'].split('=')[1]
      
      hanldDowFile(bas64, decodeURI(fileName))
      Message.success('导出成功！')
      afterDownload?.()
    } catch (e) {
      const reader = new FileReader()
      reader.readAsText(res.data, 'utf-8')
      reader.addEventListener('loadend', (res: any) => {
        try {
          const data = JSON.parse(res.currentTarget.result)
          Message.error( data.message || '导出失败')
        } catch (e) {
          Message.error('导出失败！')
        }
      })

      error?.(e as Error)
    }
  }
}
