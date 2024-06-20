import elementUI from 'element-plus'
import 'element-plus/dist/index.css'
import elLocale from 'element-plus/lib/locale/lang/zh-cn' 
import { ElDialog, ElTable, ElForm } from 'element-plus'

ElDialog.props.closeOnClickModal.default = false

ElTable.TableColumn.props.showOverflowTooltip = {
  type: Boolean,
  default: true
}

ElForm.props.labelPosition = {
  type: String,
  default: 'right'
}

export const size = 'default'

export const locale = elLocale

export default elementUI