import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({

  props: {
    dialogFormVisible: { type: Boolean, default: false },
    projectName: { type: String }
  },

  emits: {
    closeDialog: () => true
  },

  setup(props, { emit }) {

    const logContent = ref<string>('')
    const eventSourceRef = ref<EventSource | null>(null)

    onMounted(() => {
      const eventSource =
        eventSourceRef.value =
        new EventSource(`/api/get_log?projectName=${props.projectName}`)

      eventSource.onmessage = (event) => {
        logContent.value = `${event.data}`.replace(/<br>/g, '\n')
      }

      eventSource.onerror = () => {
        logContent.value = 'error'
      }
    })

    const handler = {
      closeDialog: () => {
        eventSourceRef.value?.close()

        emit('closeDialog')
      }
    }

    return () => (
      <el-dialog v-model={props.dialogFormVisible} title="Build Logs" width="80%" top="5vh"
        before-close={handler.closeDialog}
        v-slots={{
          footer: () => <>
            <div class="dialog-footer">
              <el-button onClick={handler.closeDialog}>Cancel</el-button>
            </div>
          </>
        }}
      >
        <el-input type="textarea" v-model={logContent.value} rows={30} readonly></el-input>
      </el-dialog>
    )
  }
})