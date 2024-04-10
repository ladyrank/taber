<template>
  <a-select
    :options="opts.data"
    :placeholder="placeholder"
    :field-names="fieldNames"
    :allow-clear="allowClear"
  />
</template>

<script setup>
  import Utils from '../utils/main';

  const props = defineProps({
    placeholder: {
      type: String,
      default: '',
    },
    optionStore: {
      type: Object,
      default: () => {
        return {};
      },
    },
    fieldNames: {
      type: Object,
      default: () => {
        return {};
      },
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
  });
  const opts = reactive({
    data: [],
  });
  const getOption = async () => {
    const tmpData = await Utils.ajax(props.optionStore);

    opts.data = tmpData?.results || tmpData || [];
  };

  getOption();
  defineExpose({});
</script>

<style scoped></style>
