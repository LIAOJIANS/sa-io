import { defineComponent } from "vue";


export default defineComponent({
  setup() {

    const handle = {
      handleChange: () => {

      }
    }

    return () => <div>
      <el-collapse onChange={handle.handleChange}>
        <el-collapse-item
          v-slots={{
            title: () => <div>
              2024-06-19 15:38:31 - demo
            </div>
          }}
          name="1">
          <el-descriptions title="demo">
            <el-descriptions-item label="Time">{Date.now()}</el-descriptions-item>
            <el-descriptions-item label="result">
              <el-tag size="small">Success</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="log">
              <el-button type="primary">view log</el-button>
            </el-descriptions-item>
            <el-descriptions-item label="product download">
              <el-link type="primary">download</el-link>
            </el-descriptions-item>
          </el-descriptions>
        </el-collapse-item>
        
      </el-collapse>
    </div>
  }
})