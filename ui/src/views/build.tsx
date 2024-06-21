import { defineComponent, reactive } from 'vue'

export default defineComponent({
  
  props: {
    projectName: { type: String },
    buildDailogVisible: { type: Boolean, default: false }
  },

  emits: {
    closeDialog: () => true
  },

  setup(props, { emit }) {

    const state = reactive({
      formData: {
        shell: false,
        install: false,

        shellContent: ''
      }
    })

    const handler = {
      closeDialog: () => {
        emit('closeDialog')
      },

      build: () => {

      }
    }

    return () => (
      <el-dialog v-model={ props.buildDailogVisible } width={ 800 } title={ `build ${props.projectName}` } v-slots={{
        footer: () => <>
          <div class="dialog-footer">
            <el-button onClick={handler.closeDialog}>Cancel</el-button>
            <el-button type="primary" onClick={handler.build}>
              Build
            </el-button>
          </div>
        </>
      }}>
        <div>
          is Install： 
          <el-checkbox v-model={ state.formData.install }></el-checkbox>
        </div>
        <div>
          is Shell：
          <el-checkbox v-model={ state.formData.shell }></el-checkbox>
        </div>

        {
          state.formData.shell && (
            <div>
              shell: <span style={{ color: 'red' }}>ps: custom shell scripts will completely overwrite built-in commands</span>
                <el-input type="textarea" rows={20}></el-input>
            </div>
          )
        }
      </el-dialog>
    )
  }
})