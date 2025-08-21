import { defineComponent, reactive } from 'vue'
import { ElMessage, ElForm } from 'element-plus'

import { getShellContent as apiGetShellContent, build, getPublishList, publish } from '../api'
import LogDialog from './logDialog'
import useRefs from "../hooks/useRefs";
import { PublishItem } from './publishConfig';

export default defineComponent({

  props: {
    projectName: { type: String },
    branch: { type: String },
    buildDailogVisible: { type: Boolean, default: false }
  },

  emits: {
    closeDialog: () => true
  },

  setup(props, { emit }) {

    const { onRef, refs } = useRefs({
      form: ElForm
    })

    const state = reactive({
      formData: {
        removeNm: false,
        install: false,

        branch: props.branch,

        shell: false,
        shellContent: '',

        pull: true,

        publish: false,
        pubTargetIp: '',
        pubTargetProt: '',
        pubTargetDir: '',
        pubTargetUser: '',
        pubTargetPwd: '',

        publishId: ''
      },

      publishList: [],

      rules: {
        branch: [{ required: true, message: 'Please enter the branch', trigger: 'change' }],
        shellContent: [{ required: true, message: 'Please enter the shell content', trigger: 'change' }],
        publishId: [{ required: true, message: 'Please select publish info', trigger: 'change' }],
      },

      logProjectName: '',
      dialogFormVisible: false,

      loading: false
    })

    const handler = {
      getPublishList: () => {
        getPublishList<[]>()
          .then(res => {
            state.publishList = res.data.content || []
          })
      },

      closeDialog: () => {
        emit('closeDialog')
      },

      closeLogDialog: () => {
        state.dialogFormVisible = false
      },

      publishChange: () => {
        if (state.formData.publish && state.formData.publishId) {
          const {
            id,
            describe,
            ...right
          } = state.publishList.find((c: PublishItem) => c.id === state.formData.publishId) || {} as PublishItem

          state.formData = {
            ...state.formData,
            ...right
          }

        }
      },

      build: () => {
        refs.form?.validate(fild => {
          if (fild === true) {
            state.loading = true

            build<string>({
              ...state.formData,
              projectName: props.projectName!
            })
              .then(res => {
                state.loading = false
                ElMessage({
                  type: 'success',
                  message: res.data.message
                })

                state.logProjectName = res.data.content
                state.dialogFormVisible = true
              })
              .catch(() => (state.loading = false))
          }
        })

      },

      removeNm: () => {
        if (state.formData.removeNm) {
          state.formData.install = true
        }
      },

      getShellContent: () => {
        if (state.formData.shell) {
          apiGetShellContent<string>(props.projectName!)
            .then(res => {
              state.formData.shellContent = res.data.content
            })
        }
      }
    }

    return () => (
      <>
        <el-dialog v-model={props.buildDailogVisible} top="5vh" width={800} title={`build ${props.projectName}`} v-slots={{
          footer: () => <>
            <div class="dialog-footer">
              <el-button onClick={handler.closeDialog}>Cancel</el-button>
              <el-button type="primary" onClick={handler.build}>
                Build
              </el-button>
            </div>
          </>
        }}

          before-close={handler.closeDialog}
        >
          <el-form v-loading={ state.loading } ref={onRef.form} model={state.formData} label-width={180} rules={state.rules} style={{ width: '700px' }}>

            <el-form-item label="remove node_modules">
              <el-checkbox v-model={state.formData.removeNm} onChange={handler.removeNm}></el-checkbox>
            </el-form-item>

            <el-form-item label="is Install：">
              <el-checkbox v-model={state.formData.install} onChange={handler.removeNm}></el-checkbox>
            </el-form-item>

            <el-form-item label="Branch">
              <el-input v-model={state.formData.branch}></el-input>
            </el-form-item>

            <el-form-item label="is Pull">
              <el-checkbox v-model={state.formData.pull}></el-checkbox>
            </el-form-item>

            <el-form-item label="is Shell：">
              <el-checkbox v-model={state.formData.shell} onChange={handler.getShellContent}></el-checkbox>
            </el-form-item>

            {
              state.formData.shell && (
                <el-form-item label="shell content：" prop="shellContent">
                  <span style={{ color: 'red' }}>ps: custom shell scripts will completely overwrite built-in commands</span>
                  <el-input type="textarea" v-model={state.formData.shellContent} rows={20}></el-input>
                </el-form-item>
              )
            }

            <el-form-item label="is Publish：">
              <el-checkbox v-model={state.formData.publish} onChange={handler.getPublishList}></el-checkbox>
            </el-form-item>
            {
              state.formData.publish && (
                <>
                  <el-form-item label="publish IP：" prop="publishId">
                    <el-select
                      v-model={state.formData.publishId} 
                      filterable 
                      clearable 
                      onChange={handler.publishChange}
                      style={{  }}
                    >
                      {
                        state.publishList.map((item: PublishItem) => (
                          <el-option key={item.id} label={item.describe} value={item.id}></el-option>
                        ))
                      }
                    </el-select>
                  </el-form-item>
                </>
              )
            }
          </el-form>
        </el-dialog>

        {
          state.dialogFormVisible && (
            <LogDialog
              dialogFormVisible={state.dialogFormVisible}
              projectName={state.logProjectName}
              onCloseDialog={handler.closeLogDialog}
            />
          )
        }
      </>
    )
  }
})