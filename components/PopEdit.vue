<template>
    <a-modal
        v-model:visible="config.visible"
        :title="config.title"
        :on-before-ok="JOk"
        @cancel="JCancel"
    >
        <a-form ref="domPopEdit" :model="form.data" :rules="rules">
            <a-form-item
                v-for="each in config.store.columns"
                :key="each.dataIndex"
                :field="each.dataIndex"
                :label="each.title"
            >
                <template v-if="each.optionStore">
                    <TaberSelect
                        v-if="each.xtype === 'select'"
                        v-model="form.data[each.dataIndex]"
                        :placeholder="each.placeholder"
                        :option-store="each.optionStore || {}"
                        :field-names="each.fieldNames"
                        :disabled="each.disabled"
                        allow-clear
                    >
                    </TaberSelect>
                </template>
                <template v-else>
                    <component
                        :is="'a-' + each.xtype"
                        v-model="form.data[each.dataIndex]"
                        :placeholder="each.placeholder"
                        :options="each.options || []"
                        :field-names="each.fieldNames"
                        :disabled="each.disabled"
                        allow-clear
                    ></component>
                </template>
            </a-form-item>
        </a-form>
    </a-modal>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { Message } from '@arco-design/web-vue';

import TaberSelect from './TaberSelect.vue';
import Utils from '../utils/main';

const domPopEdit = ref();
const config = reactive({
    visible: false,
    title: '',
    store: {
        columns: [],
    },
});
const form = reactive({
    data: {},
});
const rules = ref({});

const getRules = (list) => {
    const aray = {};

    list = list || [];

    list.forEach((each) => {
        each = each || {};

        if (each.rules) {
            aray[each.dataIndex] = each.rules;
        }
    });

    return aray;
};
// 显示
/**
 * cfg 弹窗 form 表单字段配置
 * resVal 弹窗 form 表单字段对应的值
 */
const show = (cfg, cfgVal) => {
    const tmpCfg = cfg;

    domPopEdit.value.resetFields();
    config.store = tmpCfg?.store || {};
    config.title = tmpCfg.name;
    config.visible = true;

    if (cfgVal) {
        form.data = cfgVal;
    }

    if (config.store.columns && config.store.columns.length) {
        rules.value = getRules(config.store.columns);
    }
};
// 提交
const JOk = async () => {
    const status = await domPopEdit.value.validate();

    if (!status) {
        try {
            const postStatus = await Utils.ajax(config.store, form.data);

            return true;
        } catch (error) {
            // eslint-disable-next-line no-undef
            Message.error(
                error?.response?.statusText || error?.message || '出错了'
            );

            return false;
        }
    } else {
        return false;
    }
};
// 取消
const JCancel = () => {
    domPopEdit.value.resetFields();
    config.visible = false;
};

defineExpose({
    show,
});
</script>

<style scoped></style>
