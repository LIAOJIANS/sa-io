import { defineComponent, onMounted, reactive } from "vue";
import { ElMessage, ElForm } from "element-plus";

import { getSysConfig, setSysConfig } from '../api'
import useRefs from "../hooks/useRefs";

export default defineComponent({
  setup() {

    const state = reactive({
      formData: {
        simuCount: '',
        concurrentCount: ''
      },

      rules: {
        concurrentCount: [{ required: true, message: 'Please enter the maximum simultaneous construction count', trigger: 'change' }],
        simuCount: [{ required: true, message: 'Please enter the concurrent count of packages for the same project', trigger: 'change', }]
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
            setSysConfig(state.formData)
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

      getSysConfig<{ concurrentCount: string, simuCount: string }>()
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
        <el-form-item label="Maximum simultaneous construction count" prop="simuCount">
          <el-input v-model={state.formData.simuCount} clearable />
        </el-form-item>
        <el-form-item label="Concurrent count of packages for the same project" prop="concurrentCount">
          <el-input v-model={state.formData.concurrentCount}  clearable />
        </el-form-item>
      </el-form>

      <div style={{ textAlign: 'center', width: '600px' }}>

        <el-button el-button type="primary" onClick={handle.submit}>保存</el-button>
      </div>
    </div>
  }
})