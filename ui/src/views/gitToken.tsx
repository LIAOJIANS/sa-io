import { defineComponent, onMounted, reactive } from "vue";
import { getGitInfo } from '../api'

export default defineComponent({
  setup() {

    const state = reactive({
      formData: {
        token: '',
        originTarget: '',
        usename: ''
      },

      rules: {
        username: [{ required: true, message: 'Please enter the git username', trigger: 'change' }],
        token: [{ required: true, message: 'Please enter the git token', trigger: 'change', }]
      }
    })

    const handle = {
      submit: () => {

      }
    }

    onMounted(() => {
      console.log(1);
      
      getGitInfo<{ username: string, token: string }>()
        .then(res => {
          console.log(res);
          
        })
    })

    return () => <div>
      <el-form model={state.formData} label-width="auto" style={{ width: '600px' }}>
        <el-form-item label="username">
          <el-input v-model={state.formData.usename} clearable />
        </el-form-item>
        <el-form-item label="Token">
          <el-input v-model={state.formData.token} type="textarea" />
        </el-form-item>
      </el-form>

      <div style={{ textAlign: 'center', width: '600px' }}>

        <el-button el-button type="primary" onClick={handle.submit}>保存</el-button>
      </div>
    </div>
  }
})