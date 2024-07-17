import { defineComponent, onMounted, reactive } from "vue";
import { ElForm, ElMessage } from "element-plus";

import useRefs from "../hooks/useRefs";
import { publish, savePublishList, getPublishById } from '../api'

export default defineComponent({

  props: {
    dialogFormVisible: { type: Boolean, default: false },
    curId: { type: [ String, Number ] }
  },

  emits: {
    closeDialog: () => true,
    fetchData: () => true
  },

  setup(props, { emit }) {

    const { onRef, refs } = useRefs({
      form: ElForm
    })

    const state = reactive({
      loading: false,

      formData: {
        describe: '',
        pubTargetIp: '',
        pubTargetProt: '',
        pubTargetDir: '',
        pubTargetUser: '',
        pubTargetPwd: '',
      },
      rules: {
        describe: [{ required: true, message: 'Please enter the describe', trigger: 'change' }],
        pubTargetIp: [{ required: true, message: 'Please enter the target ip', trigger: 'change' }],
        pubTargetProt: [{ required: true, message: 'Please enter the target port', trigger: 'change' }],
        pubTargetDir: [{ required: true, message: 'Please enter the target dir', trigger: 'change' }],
        pubTargetUser: [{ required: true, message: 'Please enter the target user', trigger: 'change' }],
        pubTargetPwd: [{ required: true, message: 'Please enter the target pwd', trigger: 'change' }],
      }
    })

    const handler = {
      closeDialog: () => {
        emit('closeDialog')
      },

      submit: () => {
        refs.form?.validate(fild => {
          if (fild === true) {
            state.loading = true
            
            savePublishList(state.formData)
              .then(res => {
                ElMessage({ message: 'success!!', type: 'success' })
                state.loading = false

                emit('fetchData')
              })
              .catch(() => (state.loading = false))
          }
        })
      }
    }

    onMounted(() => {
      props.curId && (
        state.loading = true,
        getPublishById<Record<string, string>>(props.curId)
          .then(res => {
            state.loading = false

            ;(state.formData as any) = res.data.content || {}
            
          })
          .catch(() => (state.loading = false))
      )
    })

    return () => (
      <el-dialog v-model={props.dialogFormVisible} title={ `Publish Info` } width="750px" top="5vh"
        before-close={handler.closeDialog}
        v-slots={{
          footer: () => <>
            <div class="dialog-footer">
              <el-button onClick={handler.closeDialog}>Cancel</el-button>
              <el-button type="primary" onClick={handler.submit}>Save</el-button>
            </div>
          </>
        }}
      >
        <el-form
          v-loading={state.loading}
          model={state.formData}
          rules={state.rules}
          label-width="auto"
          style={{ width: '600px' }}
          ref={onRef.form}
        >
        <el-form-item label="Describe" prop="describe">
          <el-input v-model={state.formData.describe} clearable />
        </el-form-item>
          <el-form-item label="Publish Target Ip" prop="pubTargetIp">
            <el-input v-model={state.formData.pubTargetIp} clearable />
          </el-form-item>
          <el-form-item label="Publish Target Port" prop="token">
            <el-input v-model={state.formData.pubTargetProt} clearable />
          </el-form-item>
          <el-form-item label="Publish Target Dir" prop="pubTargetDir">
            <el-input v-model={state.formData.pubTargetDir} clearable />
          </el-form-item>
          <el-form-item label="Publish Target User" prop="pubTargetUser">
            <el-input v-model={state.formData.pubTargetUser} clearable />
          </el-form-item>
          <el-form-item label="Publish Target Pwd" prop="pubTargetPwd">
            <el-input v-model={state.formData.pubTargetPwd} clearable />
          </el-form-item>
        </el-form>
      </el-dialog>
    )
  }
})