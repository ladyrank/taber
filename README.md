# Taber 表格组件

## 配置

```javascript
// 表格总配置
const config = {
  title: '列表数据查询',
  emptyTip: '空数据时显示的提示',
  // true 代表自动高度，不强制 100% 高。默认 false
  // autoHeight: true,
  rowKey: 'id',
  rowSelection: {
    // 行选择器的类型
    type: 'checkbox',
    // 是否显示全选选择器
    showCheckedAll: true,
    // 是否仅展示当前页的 keys（切换分页时清空 keys）
    onlyCurrent: true,
  },
  // 列表查询
  store: {
    url: 'http://localhost:5173/?action=query',
    // get post postForm。默认 get
    method: '',
    // jsonToFormData 或 jsonStringify
    dataFormat: ''
  },
  beforeSearch (v) {
    return v;
  },
  // 搜索配置
  search: [
    {
      title: '车型名称',
      dataIndex: 'name',
      xtype: 'input',
      placeholder: '搜索车型名称'
    },
    {
      title: '品牌名称',
      dataIndex: 'brand',
      xtype: 'select',
      placeholder: '搜索品牌名称',
      // value: 'hd',
      // 根据哪些字段读取 options 数据
      fieldNames: { value: 'id', label: 'name' },
      /**
       * 静态选项数据
       */
      options: [
        {
          label: '大众',
          value: 'vm'
        },
        {
          label: '本田',
          value: 'hd'
        }
      ],
      /**
       * 或者从接口读取数据
       */
      optionStore: {
        url: '/api/admin/partner/list',
      },
      /**
       * 2个字段关联搜索
       */
      refreshTarget(v) {
        return 'id';
      },
      refreshOptions() {
        return new Promise<void>((resolve, reject) => {
          axios
            .get(
              `/api/admin/service-cat/second_list?parentId=${checkSearchParentId}`
            )
            .then((twoOpts: any) => {
              resolve(twoOpts);
            });
        });
      },
    }
  ],
  // 表格顶部操作配置
  buttons: [
    {
      name: '新增',
      xtype: 'add',
      class: 'primary',
      icon: 'plus',
      store: {
        columns: editClm,
        url: 'http://localhost:5173/?action=create'
      }
    },
    {
      name: '顶部操作',
      class: 'success',
      icon: 'delete',
      // 顶部自定义按钮
      click: function (listData) {
        const tmp = listData

        console.log(tmp, 'listData')

        JDomTaber.value.query({
          page: 1
        })
      }
    }
  ],
  // 表格顶部操作配置
  buttonsRight: [
    {
      name: '顶部操作',
      class: 'warning',
      icon: 'export',
      click: function (listData) {
        const tmp = listData

        console.log(tmp, 'listData')

        JDomTaber.value.query({
          page: 3,
          brand: 'vm'
        })
      }
    }
  ],
  // 表格每一行操作配置
  operations: [
    {
      name: '编辑',
      class: 'warning',
      xtype: 'edit',
      store: {
        columns: [{ title: 'ID', dataIndex: 'key', disabled: true }].concat(editClm),
        url: 'http://localhost:5173/?action=edit'
      },
      // 可自定义渲染
      render(lineData, btnName) {
        return lineData.status === 0 || lineData.status === 20
          ? `<span class="RED">${btnName}</span>`
          : '';
      },
    },
    {
      name: '删除',
      class: 'danger',
      xtype: 'delete',
      store: {
        url: 'http://localhost:5173/?action=delete'
      }
    },
    {
      name: '每行自定义',
      class: 'success',
      click: function (lineData, lineIdx) {
        JDomTaber.value.query({
          page: 3,
          brand: 'vm'
        })
      }
    }
  ],
  // 表格显示列配置
  columns: [
    {
      title: 'Name',
      dataIndex: 'name',
      // render 自定义渲染
      render: function (rowData) {
        return rowData.name + ' 哈哈哈'
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      // render 自定义 html 渲染
      renderHtml: function (rowData) {
        return rowData.name + ' 哈哈哈'
      }
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      // slot 组件自定义渲染，例子：import ComSwitch from '@/components/ComSwitch.vue'
      slot: shallowRef(ComSwitch)
    },
    {
      title: 'Address',
      dataIndex: 'address'
    },
  ]
}

// 编辑弹窗字段配置
const editClm = [
  {
    title: 'Name',
    dataIndex: 'name',
    xtype: 'input',
    // 验证规则
    rules: [
      { required: true },
      {
        validator: (value, cb) => {
          if (value !== '1') {
            cb('two passwords do not match')
          } else {
            cb()
          }
        }
      }
    ]
  },
  {
    title: 'Salary',
    dataIndex: 'salary',
    xtype: 'select',
    // 根据哪些字段读取 options 数据
    fieldNames: { value: 'id', label: 'name' },
    /**
     * 静态选项数据
     */
    options: [
      {
        label: '大众',
        value: 'vm'
      },
      {
        label: '本田',
        value: 'hd'
      }
    ],
    /**
     * 或者从接口读取数据
     */
    optionStore: {
      url: '/api/admin/partner/list',
    },
    // 验证规则
    rules: [
      { required: true, message: 'name is required' },
      { minLength: 2, message: 'must be greater than 2 characters' }
    ]
  },
  {
    title: 'Address',
    dataIndex: 'address',
    xtype: 'input'
  },
  {
    title: 'Email',
    dataIndex: 'email',
    xtype: 'textarea'
  }
]
```

## 组件调用

```html
import ComTaber from '@/components/taber/ComTaber.vue'

<ComTaber ref="JDomTaber" :config="config" />
```
