import { defineComponent, onMounted, reactive } from 'vue'

import { getPublishList, deletePublis } from '../api'
import PublishDialog from './publishDialog'
import { ElMessage } from 'element-plus'

export type PublishItem = Record<string, string>

export default defineComponent({
  setup() {

    const state = reactive({
      loading: false,
      dialogFormVisible: false,
      curId: '',
      tableData: []
    })

    const handler = {
      eidt: (row: PublishItem) => {
        state.curId = row.id

        state.dialogFormVisible = true
      },

      delete: (id: string | number) => {
        state.loading = true
        deletePublis(id)
          .then(res => {

            ElMessage({ message: 'success!!', type: 'success' })
            state.loading = false
            methods.fetchData()
            
          }).catch(() => state.loading = false)
      },

      add: () => {
        state.dialogFormVisible = true
        state.curId = ''
      }
    }

    const methods = {
      fetchData() {
        state.loading = true
        getPublishList<[]>()
          .then(res => {
            state.tableData = res.data.content || []

            state.loading = false
          })
          .catch(() => state.loading = false)
      }
    }

    onMounted(() => {
      methods.fetchData()
    })

    return () => <div>
      <el-button type="primary" onClick={handler.add}>add</el-button>

      <el-table data={state.tableData} v-loading={state.loading}>
        <el-table-column prop="describe" label="Describe" width="400" />
        <el-table-column prop="pubTargetIp" label="Ip" width="150" />
        <el-table-column prop="pubTargetProt" label="Prot" width="80" />
        <el-table-column prop="pubTargetDir" label="Static Dir" />
        <el-table-column prop="pubTargetUser" label="Server User" />
        <el-table-column label="operation" width="180"
          v-slots={{
            default: ({ row }: { row: PublishItem }) => <>
              <el-button type="primary" onClick={() => handler.eidt(row)}>Eidt</el-button>
              <el-button type="danger" onClick={() => handler.delete(row.id)}>del</el-button>
            </>
          }}
        />
      </el-table>

      {
        state.dialogFormVisible && (
          <PublishDialog
            dialogFormVisible={state.dialogFormVisible}
            curId={ state.curId }
            onCloseDialog={() => state.dialogFormVisible = false}
            onFetchData={() => {
              methods.fetchData()

              state.dialogFormVisible = false
            }}
          />
        )
      }
    </div>
  }

})