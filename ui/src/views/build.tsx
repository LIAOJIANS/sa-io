import { defineComponent, reactive } from 'vue'
import { ElMessage, ElForm } from 'element-plus'

import { getShellContent as apiGetShellContent, build } from '../api'
import LogDialog from './logDialog'
import useRefs from "../hooks/useRefs";

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
        install: true,

        branch: props.branch,

        shell: false,
        shellContent: '',

        pull: false,

        publish: false,
        pubTargetIp: '',
        pubTargetProt: '',
        pubTargetDir: '',
        pubTargetUser: '',
        pubTargetPwd: ''
      },

      rules: {
        branch: [{ required: true, message: 'Please enter the branch', trigger: 'change' }],
        shellContent: [{ required: true, message: 'Please enter the shell content', trigger: 'change' }],
        pubTargetIp: [{ required: true, message: 'Please enter the target ip', trigger: 'change' }],
        pubTargetProt: [{ required: true, message: 'Please enter the target port', trigger: 'change' }],
        pubTargetDir: [{ required: true, message: 'Please enter the target dir', trigger: 'change' }],
        pubTargetUser: [{ required: true, message: 'Please enter the target user', trigger: 'change' }],
        pubTargetPwd: [{ required: true, message: 'Please enter the target pwd', trigger: 'change' }],
      },
      
      logProjectName: '',
      dialogFormVisible: false
    })

    const handler = {
      closeDialog: () => {
        emit('closeDialog')
      },

      closeLogDialog: () => {
        state.dialogFormVisible = false
      },

      build: () => {
        refs.form?.validate(fild => {
          if (fild === true) {
            build<string>({
              ...state.formData,
              projectName: props.projectName!
            })
              .then(res => {
                ElMessage({
                  type: 'success',
                  message: res.data.message
                })
    
                state.logProjectName = res.data.content
                state.dialogFormVisible = true
              })
          }
        })
        
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
          <el-form ref={ onRef.form } model={state.formData} label-width={140} rules={state.rules} style={{ width: '700px' }}>

            <el-form-item label="is Install：">
              <el-checkbox v-model={state.formData.install}></el-checkbox>
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
              <el-checkbox v-model={state.formData.publish}></el-checkbox>
            </el-form-item>
            {
              state.formData.publish && (
              <>
                <el-form-item label="publish IP：" prop="pubTargetIp">
                  <el-input v-model={state.formData.pubTargetIp}></el-input>
                </el-form-item>
                <el-form-item label="publish Port：" prop="pubTargetProt">
                  <el-input v-model={state.formData.pubTargetProt}></el-input>
                </el-form-item>
                <el-form-item label="publish Dir：" prop="pubTargetDir">
                  <el-input v-model={state.formData.pubTargetDir}></el-input>
                </el-form-item>
                <el-form-item label="publish User：" prop="pubTargetUser">
                  <el-input v-model={state.formData.pubTargetUser}></el-input>
                </el-form-item>
                <el-form-item label="publish Pwd：" prop="pubTargetPwd">
                  <el-input v-model={state.formData.pubTargetPwd}></el-input>
                </el-form-item>
              </>
              )
            }
          </el-form>
        </el-dialog>

        {
          state.dialogFormVisible && (
            <LogDialog 
              dialogFormVisible={ state.dialogFormVisible }
              projectName={ state.logProjectName }
              onCloseDialog={ handler.closeLogDialog }
            />
          )
        }
      </>
    )
  }
})