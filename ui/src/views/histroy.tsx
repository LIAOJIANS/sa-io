import { defineComponent, onMounted, reactive } from 'vue';
import { dateFormat } from 'js-hodgepodge';
import { ElMessage } from 'element-plus';

import { getHistroys, download, getPublishList, publish, getProjects, deleteHistory } from '../api';
import { download as dow } from '../utils/download';
import LogDialog from './logDialog';

import { PublishItem } from './publishConfig';

export default defineComponent({
  setup() {
    const state = reactive({
      historys: [],
      soureHistory: [],
      logDialogVisible: false,
      publishDialogVisible: false,
      currentName: '',
      collapse: [],
      loading: false,
      publishList: [],
      publishId: '',
      delTimes: [],
      projects: [],
      searchProjectName: ''
    } as {
      historys: {
        buildTime: number;
        projectName: string;
        status: string;
        branch: string;
      }[]
      soureHistory: {
        buildTime: number;
        projectName: string;
        status: string;
        branch: string;
      }[]
      logDialogVisible: boolean;
      publishDialogVisible: boolean;
      currentName: string;
      collapse: string[];
      loading: boolean;
      publishList: PublishItem[];
      publishId: string;
      delTimes: number[];
      projects: Record<string, string>[],
      searchProjectName: string
    });

    const shortcuts = [
      {
        text: 'Last week',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setDate(start.getDate() - 7)
          return [start, end]
        },
      },
      {
        text: 'Last month',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setMonth(start.getMonth() - 1)
          return [start, end]
        },
      },
      {
        text: 'Last 3 months',
        value: () => {
          const end = new Date()
          const start = new Date()
          start.setMonth(start.getMonth() - 3)
          return [start, end]
        },
      },
    ]

    const handler = {
      getPublishList: () => {
        getPublishList<[]>().then((res) => {
          state.publishList = res.data.content || [];
        });
      },

      historySearch: () => {
        let [starTime, endTime] = state.delTimes || []

        if (starTime && endTime) {

          const date = (
            timer?: number
          ) => timer ? new Date(timer).getTime() : new Date().getTime()

          starTime = date(starTime)

          endTime = starTime === date(endTime) ? date() : date(endTime)
        }

        state.historys = state.soureHistory.filter(c => {
          if (!(starTime && endTime) && !state.searchProjectName) {
            return true
          }

          if (!(starTime && endTime)) {

            return c.projectName === state.searchProjectName
          }

          if (!state.searchProjectName) {
            return c.buildTime >= starTime && c.buildTime <= endTime
          }

          return c.projectName === state.searchProjectName && c.buildTime >= starTime && c.buildTime <= endTime
        })

      },

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

      deletHistory: () => {
        state.loading = true;
        deleteHistory(
          state.historys.map(c => ({
            ...c,
            projectName: `${c.projectName}-${c.buildTime}`,
          }))
        )
          .then((res) => {
            handler.fetchData()
            ElMessage({ message: 'success!!', type: 'success' });
            state.loading = false;
          })
          .catch(() => (state.loading = false));
      },

      fetchData: () => {
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
            state.historys = state.soureHistory = (res.data.content || []).sort(
              (a, b) => b.buildTime - a.buildTime,
            );
  
            state.collapse = state.historys.map(
              (c) => `${c.buildTime} - ${c.projectName}`,
            );
  
            state.loading = false;
          })
          .catch(() => (state.loading = false));
      }
    }

    onMounted(() => {

      handler.fetchData()
    
      getProjects<[]>()
        .then((res) => {

          state.projects = res.data.content || [];

        })
    });

    return () => (
      <div v-loading={state.loading}>
        <div style={{ marginBottom: '20px' }}>
          <el-date-picker
            v-model={state.delTimes}
            type="daterange"
            shortcuts={shortcuts}
            range-separator="至"
            start-placeholder="开始日期"
            clearable
            end-placeholder="结束日期">
          </el-date-picker>

          <el-select v-model={state.searchProjectName} style={{ width: '350px' }} clearable>
            {
              state.projects.map((c) => <el-option label={c.projectName} value={c.projectName}></el-option>)
            }
          </el-select>


          <el-button type="primary" style={{ marginLeft: '20px' }} onClick={handler.historySearch}>Search</el-button>
          <el-button type="danger" onClick={handler.deletHistory}>Delete</el-button>
        </div>

        <el-collapse v-model={state.collapse}>
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
                  <el-link type="primary" onClick={() => handler.download(c)} disabled={c.status !== 'success'} >
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
