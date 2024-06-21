import { defineComponent, onMounted, reactive } from "vue";
import { ElMessage } from "element-plus";

import { createProject, getProjects, deleteProject } from '../api'
import Build from './build'

export default defineComponent({
  setup() {

    const state = reactive({
      tableData: [],

      formData: {
        projectName: '',
        targetUrl: ''
      },

      loading: {
        formLoading: false,
        tabLoading: false
      },

      dialogFormVisible: false,
      buildDailogVisible: false,
      buildProjectName: '',

      rules: {
        projectName: [{ required: true, message: 'Please enter the git Project Name', trigger: 'change' }],
        targetUrl: [{ required: true, message: 'Please enter the git Target Url', trigger: 'change', }]
      }
    })

    const handler = {
      handleCreate: () => {

        methods.loading('form', true)

        createProject(state.formData)
          .then(() => {

            ElMessage({ message: 'success!!', type: 'success' })

            methods
              .loading('form')

            handler
              .handleDialog(false)

            methods
              .fetchData()
          })
          .catch(() => methods.loading('form'))
      },

      handleDialog: (flag: boolean) => state.dialogFormVisible = flag,

      beforeBuild: (projectName: string) => {
        
        state.buildProjectName = projectName
        state.buildDailogVisible = true
      },

      delete: (projectName: string) => {
        methods.loading('tab', true)

        deleteProject(projectName)
          .then(() => {
            methods.loading('tab')

            methods.fetchData()
          })
          .catch(() => methods.loading('tab'))
      }
    }

    const methods = {
      loading: (k: string, flag: boolean = false) => {
        const key = `${k}Loading`

        state.loading[key as keyof { formLoading: boolean, tabLoading: boolean }] = flag
      },

      fetchData: () => {
        methods.loading('tab', true)

      getProjects<[]>()
        .then(res => {

          state.tableData = res.data.content || []
          methods.loading('tab')

        })
        .catch(() => methods.loading('tab'))
      }
    }

    onMounted(() => {
      methods
        .fetchData()
      
    })

    return () => <div>
      <el-button type="primary" onClick={() => handler.handleDialog(true)}>add</el-button>
      <el-table data={state.tableData} v-loading={ state.loading.tabLoading }>
        <el-table-column prop="projectName" label="Project Name"  width="300"/>
        <el-table-column prop="branch" label="Branch"  width="100"/>
        <el-table-column prop="targetUrl" label="Target Url" />
        <el-table-column label="operation" width="180"
          v-slots={{
            default: ({ row }:  { row: any } ) => <>
              <el-button type="primary" onClick={ () => handler.beforeBuild(row.projectName) }>build</el-button>
              <el-button type="danger" onClick={ () => handler.delete(row.projectName) }>del</el-button>
            </>
          }}
        />
      </el-table>

      <el-dialog v-model={state.dialogFormVisible} title="Create Project" width="500"
        v-slots={{
          footer: () => <>
            <div class="dialog-footer">
              <el-button onClick={() => handler.handleDialog(false)}>Cancel</el-button>
              <el-button type="primary" onClick={handler.handleCreate}>
                Confirm
              </el-button>
            </div>
          </>
        }}
      >
        <el-form model={state.formData} label-width={140} rules={state.rules} v-loading={ state.loading.formLoading }>
          <el-form-item label="Project Name" prop="projectName">
            <el-input v-model={state.formData.projectName} clearable />
          </el-form-item>
          <el-form-item label="Target Url" prop="targetUrl" >
            <el-input v-model={state.formData.targetUrl} clearable />
          </el-form-item>
        </el-form>
      </el-dialog>
      
      { state.buildDailogVisible && (
        <Build
          buildDailogVisible={ state.buildDailogVisible }
          projectName={ state.buildProjectName }
          onCloseDialog={ () => ( state.buildDailogVisible = false ) }
        />
      ) }
      
    </div>
  }
})