import { defineComponent, onMounted, reactive } from "vue";
import { ElMessage, ElForm } from "element-plus";

import { getWsConfig, setWsConfig } from '../api'
import useRefs from "../hooks/useRefs";

export default defineComponent({
  setup() {

    const state = reactive({
      formData: {
        wsUrl: ''
      },

      rules: {
        wsUrl: [{ required: true, message: 'Please enter the wsUrl', trigger: 'change' }],
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
            setWsConfig(state.formData)
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

      state.loading = true
      getWsConfig<{ wsUrl: string }>()
        .then(res => {
          state.formData = res.data.content
          state.loading = false
        })
        .catch(() => (state.loading = false))
    })

    return () => <div>
      <el-form
        model={state.formData}
        v-loading={state.loading}
        rules={state.rules}
        label-width="auto"
        style={{ width: '600px' }}
        ref={onRef.form}
      >
        <el-form-item label="WS URL" prop="wsUrl">
          <el-input v-model={state.formData.wsUrl}  clearable />
        </el-form-item>
      </el-form>

      <div style={{ textAlign: 'center', width: '600px' }}>

        <el-button el-button type="primary" onClick={handle.submit}>保存</el-button>
      </div>
    </div>
  }
})