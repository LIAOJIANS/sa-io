import { defineComponent, onMounted, reactive } from "vue";
import { getHistroys } from '../api'
import { dateFormat } from 'js-hodgepodge'
import LogDialog from "./logDialog";
import { ElMessage } from 'element-plus'

export default defineComponent({
  setup() {

    const state = reactive({
      historys: [],
      logDialogVisible: false,
      currentName: '',
      collapse: []
    } as {
      historys: {
        buildTime: number,
        projectName: string,
        status: string
      }[],
      logDialogVisible: boolean,
      currentName: string,
      collapse: string[]
    })

    const handler = {
      handleChange: () => {

      },

      viewLog: (name: string) => {
        state.logDialogVisible = true
        state.currentName = name
      },

      download: (row: {buildTime: number,projectName: string,status: string}) => {
        if(row.status === 'error') {
          return ElMessage({
            type: 'error',
            message: 'error build!!!'
          })
        }


      }

    }

    onMounted(() => {
      getHistroys<[{
        buildTime: number,
        projectName: string,
        status: string
      }]>()
        .then(res => {
          state.historys = (res.data.content || []).sort((a, b) => b.buildTime - a.buildTime)

          state.collapse = state.historys.map(c => `${c.buildTime} - ${c.projectName}`)
        })
    })

    return () => <div>
      <el-collapse onChange={handler.handleChange} v-model={ state.collapse }>
        {
          state.historys.map(c => (
            <el-collapse-item
              v-slots={{
                title: () => <div>
                  { dateFormat(c.buildTime, '{Y}-{MM}-{DD} {A} {hh}:{ii}:{ss}') } - { c.projectName }
                </div>
              }}
              name={ `${c.buildTime} - ${c.projectName}` }>
              <el-descriptions title={ c.projectName }>
                <el-descriptions-item label="Time">{dateFormat(c.buildTime, '{Y}-{MM}-{DD} {A} {hh}:{ii}:{ss}')}</el-descriptions-item>
                <el-descriptions-item label="result">
                  <el-tag size="small" type={ c.status === 'success' ? 'success' : 'danger' }>{ c.status }</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="log">
                  <el-button type="primary" onClick={ () => handler.viewLog(`${c.projectName}-${c.buildTime}`) }>view log</el-button>
                </el-descriptions-item>
                <el-descriptions-item label="product download">
                  <el-link type="primary" onClick={() => handler.download(c) }>download</el-link>
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>
          ))
        }
      </el-collapse>
        
      {
        state.logDialogVisible && (
          <LogDialog 
            projectName = {state.currentName}
            dialogFormVisible={ state.logDialogVisible }
            onCloseDialog={ () => state.logDialogVisible = false }
          />
        )
      }
    </div>
  }
})