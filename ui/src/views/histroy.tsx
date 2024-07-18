import { defineComponent, onMounted, reactive } from 'vue';
import { dateFormat } from 'js-hodgepodge';
import { ElMessage } from 'element-plus';

import { getHistroys, download, getPublishList, publish } from '../api';
import { download as dow } from '../utils/download';
import LogDialog from './logDialog';
import PublishDialog from './publishDialog';
import { PublishItem } from './publishConfig';

export default defineComponent({
  setup() {
    const state = reactive({
      historys: [],
      logDialogVisible: false,
      publishDialogVisible: false,
      currentName: '',
      collapse: [],
      loading: false,
      publishList: [],
      publishId: '',
    } as {
      historys: {
        buildTime: number;
        projectName: string;
        status: string;
        branch: string;
      }[];
      logDialogVisible: boolean;
      publishDialogVisible: boolean;
      currentName: string;
      collapse: string[];
      loading: boolean;
      publishList: PublishItem[];
      publishId: string;
    });

    const handler = {
      getPublishList: () => {
        getPublishList<[]>().then((res) => {
          state.publishList = res.data.content || [];
        });
      },

      handleChange: () => {},

      viewLog: (name: string) => {
        state.logDialogVisible = true;
        state.currentName = name;
      },

      publish: (name: string) => {
        state.loading = true
        
        state.currentName = name;

        const { id, describe, ...right } =
          state.publishList.find(
            (c: PublishItem) => c.id === state.publishId,
          ) || ({} as PublishItem);
        
        publish({
          ...right,
          projectName: name,
        })
          .then((res) => {
            ElMessage({ message: 'success!!', type: 'success' });
            state.loading = false;
          })
          .catch(() => (state.loading = false));
      },

      download: (row: {
        buildTime: number;
        projectName: string;
        status: string;
      }) => {
        if (row.status === 'error') {
          return ElMessage({
            type: 'error',
            message: 'error build!!!',
          });
        }
        state.loading = true;
        download<any>(`${row.projectName}-${row.buildTime}`)
          .then((res) => {
            console.log(res);

            dow.export({
              res,
              beforeDownload: () => (state.loading = true),
              afterDownload: () => (state.loading = false),
              error: () => (state.loading = false),
            });
          })
          .catch(() => (state.loading = false));
      },
    };

    onMounted(() => {
      state.loading = true;
      getHistroys<
        [
          {
            buildTime: number;
            projectName: string;
            status: string;
            branch: string;
          },
        ]
      >()
        .then((res) => {
          state.historys = (res.data.content || []).sort(
            (a, b) => b.buildTime - a.buildTime,
          );

          state.collapse = state.historys.map(
            (c) => `${c.buildTime} - ${c.projectName}`,
          );

          state.loading = false;
        })
        .catch(() => (state.loading = false));
    });

    return () => (
      <div v-loading={state.loading}>
        <el-collapse onChange={handler.handleChange} v-model={state.collapse}>
          {state.historys.map((c) => (
            <el-collapse-item
              v-slots={{
                title: () => (
                  <div>
                    {dateFormat(
                      c.buildTime,
                      '{Y}-{MM}-{DD} {A} {hh}:{ii}:{ss}',
                    )}{' '}
                    - {c.projectName}
                  </div>
                ),
              }}
              name={`${c.buildTime} - ${c.projectName}`}
            >
              <el-descriptions title={c.projectName}>
                <el-descriptions-item label="Build Time">
                  {dateFormat(c.buildTime, '{Y}-{MM}-{DD} {A} {hh}:{ii}:{ss}')}
                </el-descriptions-item>
                <el-descriptions-item label="result">
                  <el-tag
                    size="small"
                    type={c.status === 'success' ? 'success' : 'danger'}
                  >
                    {c.status}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="">
                  <el-button
                    type="primary"
                    onClick={() =>
                      handler.viewLog(`${c.projectName}-${c.buildTime}`)
                    }
                  >
                    log
                  </el-button>
                </el-descriptions-item>
                <el-descriptions-item label="Branch">
                  <span style={{ fontWeight: 'bold' }}>{c.branch}</span>
                </el-descriptions-item>
                <el-descriptions-item label="product">
                  <el-link type="primary" onClick={() => handler.download(c)}>
                    download
                  </el-link>
                </el-descriptions-item>
                <el-descriptions-item label="">
                  {c.status === 'success' && (
                    <el-popover
                      trigger="click"
                      placement="top"
                      width="300"
                      v-slots={{
                        reference: () => (
                          <el-button
                            type="primary"
                            onClick={handler.getPublishList}
                          >
                            publish
                          </el-button>
                        ),
                      }}
                    >
                      <p>Are you sure to publish this?</p>
                      <el-select v-model={state.publishId} filterable clearable>
                        {state.publishList.map((item: PublishItem) => (
                          <el-option
                            key={item.id}
                            label={item.describe}
                            value={item.id}
                          ></el-option>
                        ))}
                      </el-select>
                      <div style="text-align: right; margin-top: 20px">
                        <el-button
                          size="small"
                          type="primary"
                          onClick={() =>
                            handler.publish(`${c.projectName}-${c.buildTime}`)
                          }
                        >
                          confirm
                        </el-button>
                      </div>
                    </el-popover>
                  )}
                </el-descriptions-item>
              </el-descriptions>
            </el-collapse-item>
          ))}
        </el-collapse>

        {state.logDialogVisible && (
          <LogDialog
            projectName={state.currentName}
            dialogFormVisible={state.logDialogVisible}
            onCloseDialog={() => (state.logDialogVisible = false)}
          />
        )}

        {/* {
        state.publishDialogVisible && (
          <PublishDialog
            projectName={state.currentName}
            dialogFormVisible={state.publishDialogVisible}
            onCloseDialog={() => state.publishDialogVisible = false}
          />
        )
      } */}
      </div>
    );
  },
});
