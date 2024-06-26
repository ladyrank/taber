<template>
  <div class="comTaber">
    <div v-if="state.search.length" class="container-header">
      <!-- 搜索 -->
      <a-form
        ref="domFormSearch"
        class="taber-hd"
        :model="state.filters"
        :label-col-props="{ span: 6 }"
        :wrapper-col-props="{ span: 18 }"
        label-align="left"
        layout="inline"
        :size="appStore.table.size"
        @submit="JSearch"
      >
        <a-form-item
          v-for="each in state.search"
          :key="each.dataIndex"
          :field="each.dataIndex"
          :style="{ width: '180px' }"
        >
          <template v-if="each.optionStore">
            <TaberSelect
              v-if="each.xtype === 'select'"
              v-model="state.filters[each.dataIndex]"
              :placeholder="each.placeholder || each.title"
              :option-store="each.optionStore || {}"
              :field-names="each.fieldNames"
              allow-clear
              allow-search
            >
            </TaberSelect>
          </template>
          <template v-else-if="each.slot">
            <component
              :is="each.slot"
              v-model="state.filters[each.dataIndex]"
              :data="each"
            ></component>
          </template>
          <template v-else>
            <component
              :is="'a-' + each.xtype"
              v-model="state.filters[each.dataIndex]"
              :placeholder="each.placeholder || each.title"
              :options="each.options || []"
              :field-names="each.fieldNames"
              :min="each.min"
              :max="each.max"
              allow-clear
              allow-search
            ></component>
          </template>
        </a-form-item>

        <a-form-item>
          <a-button
            class="mr10"
            html-type="submit"
            type="primary"
            @click="JSearch"
          >
            <template #icon> <icon-search /> </template>查询
          </a-button>
          <a-button class="mr10" @click="JReset">
            <template #icon> <icon-eraser /> </template>重置
          </a-button>
        </a-form-item>
      </a-form>
    </div>

    <div class="container-action-btns">
      <a-row v-if="state.buttons.length || state.buttonsRight.length">
        <a-col :span="12">
          <a-space>
            <a-button
              v-for="each in state.buttons"
              :key="each.name"
              type="primary"
              :status="each.class || ''"
              @click="JTopClick(each)"
            >
              <template v-if="each.icon" #icon>
                <component :is="'icon-' + each.icon"></component>
              </template>
              {{ each.name }}
            </a-button>
          </a-space>
        </a-col>
        <a-col
          :span="12"
          style="display: flex; align-items: center; justify-content: end"
        >
          <a-space>
            <a-button
              v-for="each in state.buttonsRight"
              :key="each.name"
              :type="each.class ? 'primary' : 'secondary'"
              :status="each.class || ''"
              @click="JTopClick(each)"
            >
              <template v-if="each.icon" #icon>
                <component :is="'icon-' + each.icon"></component>
              </template>
              {{ each.name }}
            </a-button>
          </a-space>
        </a-col>
      </a-row>
    </div>

    <div class="container-main">
      <!-- 表格内容 -->
      <a-table
        :loading="loading"
        class="taber-list"
        :data="state.result"
        :pagination="pagination"
        :bordered="{ cell: true }"
        :sticky-header="true"
        style="height: 100%"
        column-resizable
        @page-change="JPaging"
        @page-size-change="JPagingSize"
      >
        <template #columns>
          <a-table-column
            v-for="each in state.clms"
            :key="each.dataIndex"
            :title="each.title"
            :data-index="each.dataIndex"
            :width="each.width"
            :fixed="each.fixed"
          >
            <template #cell="{ record, rowIndex }">
              <template v-if="each.slot">
                <component :is="each.slot" :data="record"></component>
              </template>

              <template v-if="!each.slot">
                <template v-if="each.renderHtml">
                  <span v-html="each.renderHtml(Utils.deepCopy(record))"></span>
                </template>
                <template v-else>
                  {{
                    each.render
                      ? each.render(Utils.deepCopy(record))
                      : state.result?.[rowIndex]?.[each.dataIndex]
                  }}
                </template>
              </template>
            </template>
          </a-table-column>

          <template v-if="state.operations.length">
            <a-table-column
              title="操作"
              :width="cfg.operationsWidth"
              fixed="right"
            >
              <template #cell="{ record, rowIndex }">
                <template v-for="item in state.operations" :key="item.name">
                  <a-link
                    v-if="
                      item.xtype !== 'delete' &&
                      item.render &&
                      item.render(Utils.deepCopy(record), item.name)
                    "
                    type="text"
                    @click="JRowAct(item, record, rowIndex)"
                  >
                    <span
                      v-html="item.render(Utils.deepCopy(record), item.name)"
                    ></span
                  ></a-link>
                  <a-link
                    v-if="item.xtype !== 'delete' && !item.render"
                    type="text"
                    @click="JRowAct(item, record, rowIndex)"
                    >{{ item.name }}</a-link
                  >
                  <a-popconfirm
                    v-if="item.xtype === 'delete'"
                    content="确定删除吗?"
                    @ok="JConfirmDel(item, record)"
                  >
                    <a-link type="text">
                      {{ item.name }}
                    </a-link>
                  </a-popconfirm>
                </template>
              </template>
            </a-table-column>
          </template>
        </template>
      </a-table>
      <!-- 表格分页 -->
      <!-- <a-pagination
        class="taber-page"
        :total="state.paging.total || 0"
        :current="state.filters.page"
        :page-size="state.filters.limit"
        show-page-size
        show-total
        show-jumper
        @change="JPaging"
        @page-size-change="JPagingSize"
      /> -->
    </div>

    <!-- 表格新增或编辑弹窗 -->
    <PopEdit ref="domPop" />
  </div>
</template>

<script setup>
  import { reactive, ref } from 'vue';
  // import { Message } from '@arco-design/web-vue';

  import Utils from './utils/main';
  import PopEdit from './components/PopEdit.vue';
  import TaberSelect from './components/TaberSelect.vue';

  const appStore = useAppStore();
  const domPop = ref(null);
  const domFormSearch = ref(null);
  const loading = ref(false);
  const props = defineProps({
    // 配置
    config: {
      type: Object,
      default() {
        return {
          queryUrl: '',
          search: [],
        };
      },
    },
  });
  const cfg = props.config || {};
  const state = reactive({
    result: [],
    paging: {
      total: 0,
    },
    // 搜索参数
    filters: {
      page: 1,
      limit: 20,
    },
    title: cfg.title || '',
    // 搜索里一排放几列
    searchRowColumn: cfg.searchRowColumn || 4,
    clms: cfg.columns || [],
    // 搜索配置
    search: cfg.search || [],
    // 顶部操作左侧按钮
    buttons: cfg.buttons || [],
    // 顶部操作右侧按钮
    buttonsRight: cfg.buttonsRight || [],
    // 每一行操作按钮
    operations: cfg.operations || [],
  });

  const pagination = computed(() => {
    return {
      total: state.paging.total || 0,
      current: state.paging.page,
      pageSize: state.paging.limit,
      showTotal: true,
      showJumper: true,
      showPageSize: true,
      pageSizeOptions: [20, 50, 100, 200, 300, 500],
    };
  });

  onMounted(() => {
    useTableHeight();
  });

  // 初始化搜索配置项默认值
  const loopSearch = (list) => {
    list = list || [];

    list.forEach((v) => {
      v = v || {};

      state.filters[v.dataIndex] = v?.value;
    });
  };
  // 查询
  const query = async (queryParam) => {
    queryParam = queryParam || {};

    loading.value = true;

    // 多个字段的特殊处理
    // @ts-ignore
    // eslint-disable-next-line no-restricted-syntax
    for (const p in state.filters) {
      if (p && p.match(/,/gi)) {
        const newKey = p.split(',') || [];
        const newValue = (state.filters?.[p] || '').split(',');

        newKey.forEach((keyItem, keyIdx) => {
          state.filters[keyItem] = newValue[keyIdx];
        });
      }
    }

    try {
      const params = Object.assign(state.filters, queryParam);
      const response = (await Utils.ajax(cfg.store, params)) || {};

      state.result = response.results || [];
      state.paging = response.page || {};
    } finally {
      loading.value = false;
    }

    window.scrollTo(0, 0);
  };
  // 翻页
  const JPaging = (e) => {
    state.filters.page = e;
    query();
  };
  const JPagingSize = (e) => {
    state.filters.page = 1;
    state.filters.limit = e;
    query();
  };
  // 搜索
  const JSearch = () => {
    state.filters.page = 1;
    query();
  };
  // 重置
  const JReset = () => {
    domFormSearch.value.resetFields();
    JSearch();
  };
  // 表格顶部按钮点击
  const JTopClick = (row) => {
    row = row || {};

    switch (row.xtype) {
      case 'add':
        domPop.value.show(Utils.deepCopy(row));
        break;

      default:
        if (row.click) {
          row.click(Utils.deepCopy(state.result));
        }
        break;
    }
  };
  // 表格每一行操作点击
  const JRowAct = (action, rowData, rowIndex) => {
    action = action || {};

    if (action.click) {
      action.click(Utils.deepCopy(rowData), rowIndex);
    }

    switch (action.xtype) {
      case 'edit':
        domPop.value.show(Utils.deepCopy(action), Utils.deepCopy(rowData));
        break;

      default:
        break;
    }
  };
  // 点击确认删除
  const JConfirmDel = async (action, rowData) => {
    try {
      const delParam = {};
      const propKey = action?.store?.propKey || 'id';
      const valueKey = action?.store?.valueKey || 'id';

      delParam[propKey] = rowData[valueKey];

      const delRes = await Utils.ajax(action?.store, delParam);

      query();
      // eslint-disable-next-line no-console
      console.log(delRes, 'delRes');
    } finally {
      // eslint-disable-next-line no-console
      console.log(1);
    }
  };

  if (cfg.store.url) {
    query();
  }

  loopSearch(cfg.search);

  defineExpose({
    query,
  });
</script>

<style scoped>
  .taber-page {
    margin: 10px 0 0;
    justify-content: end;
  }

  .taber-btn {
    margin: 0 0 10px;
    text-align: right;
  }

  .taber-btn .arco-btn {
    margin-left: 10px;
  }
</style>
