import { defineComponent, onMounted, reactive } from "vue";
import { delTagByName, getTags } from '../api'
import { ElMessage } from 'element-plus'

export default defineComponent({

  props: {
    tagsProjectName: { type: String },
    tagsDialog: { type: Boolean }
  },

  emits: {
    closeDialog: () => true
  },

  setup(props, { emit }) {

    const state = reactive({
      tableData: [],
      loading: false
    } as {
      tableData: Record<string, string>[]
      loading: boolean
    })

    const handler = {
      closeDialog: () => emit('closeDialog'),

      delete: (tagName: string) => {
        state.loading = true
        delTagByName<{}>(tagName)
          .then(res => {
            ElMessage({ message: 'success!!', type: 'success' })
            state.loading = false

            methods.fetchData()
          })
          .catch(() => ( state.loading = false ))
      }
    }

    const methods = {
      fetchData() {
        state.loading = true
        
        getTags<string[]>(props.tagsProjectName!)
          .then(res => {

            state.tableData = res.data.content.map(c => {
              const [ tagName, branch, commitId ] = c.split('-')

              return {
                tagName,
                branch,
                commitId
              }
            })
            
            state.loading = false
          })
          .catch(() => ( state.loading = false ))
      }
    }

    onMounted(() => {
      methods.fetchData()
    })

    return () => (
      <el-dialog v-model={props.tagsDialog} title={`${props.tagsProjectName} Termianl`} width="50%" top="5vh"
        before-close={handler.closeDialog}
        v-slots={{
          footer: () => <>
            <div class="dialog-footer">
              <el-button onClick={handler.closeDialog}>Cancel</el-button>
            </div>
          </>
        }}
      >
        <el-table
          data={ state.tableData }
          v-loading={ state.loading }
          border
          height="250"
        >
          <el-table-column prop="tagName" label="Tag Name" />
          <el-table-column prop="branch" label="Branch" width="140" />
          <el-table-column prop="commitId" label="CommitId" />
          <el-table-column label="Operation" width="100"
          v-slots={{
            default: ({ row }:  { row: any } ) => <>
              <el-button type="danger" onClick={ () => handler.delete(`${row.tagName}-${row.branch}-${row.commitId}`) }>del</el-button>
            </>
          }}
        />
        </el-table>

      </el-dialog>
    )
  }
})