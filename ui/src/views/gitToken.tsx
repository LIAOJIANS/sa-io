import { defineComponent, onMounted, reactive } from "vue";
import { ElMessage, ElForm } from "element-plus";

import { getGitInfo, setGitInfo } from '../api'
import useRefs from "../hooks/useRefs";

export default defineComponent({
  setup() {

    const state = reactive({
      formData: {
        token: '',
        username: ''
      },

      rules: {
        username: [{ required: true, message: 'Please enter the git username', trigger: 'change' }],
        token: [{ required: true, message: 'Please enter the git token', trigger: 'change', }]
      },

      loading: false
    })

    const { onRef, refs } = useRefs({
      form: ElForm
    })

    const handle = {
      submit: () => {
        refs.form?.validate(fild => {
          if (fild === true) {
            state.loading = true
            setGitInfo(state.formData)
              .then(res => {
                ElMessage({ message: 'success!!', type: 'success' })
                state.loading = false
              })
              .catch(() => (state.loading = false))
          }
        })
      }
    }

    onMounted(() => {

      getGitInfo<{ username: string, token: string }>()
        .then(res => {
          state.formData = res.data.content
        })
    })

    return () => <div>
      <el-form
        v-loading={state.loading}
        model={state.formData}
        rules={state.rules}
        label-width="auto"
        style={{ width: '600px' }}
        ref={onRef.form}
      >
        <el-form-item label="username" prop="username">
          <el-input v-model={state.formData.username} clearable />
        </el-form-item>
        <el-form-item label="Token" prop="token">
          <el-input v-model={state.formData.token} type="textarea" />
        </el-form-item>
      </el-form>

      <div style={{ textAlign: 'center', width: '600px' }}>

        <el-button el-button type="primary" onClick={handle.submit}>保存</el-button>
      </div>
    </div>
  }
})