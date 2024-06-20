import { defineComponent, reactive } from "vue";


export default defineComponent({
  setup() {

    const state = reactive({
      tableData: []
    })

    return () => <div>
      <el-table data={ state.tableData }>
        <el-table-column prop="date" label="project name" />
        <el-table-column prop="is install" label="Name" width="180" />
        <el-table-column prop="address" label="operation" width="180"  />
      </el-table>
    </div>
  }
})