export default {
  deepCopy(data) {
    const typeCheck = (tmpData) => {
      const typeObj = {
        '[object String]': 'string',
        '[object Number]': 'number',
        '[object Boolean]': 'boolean',
        '[object Object]': 'object',
        '[object Null]': 'null',
        '[object Undefined]': 'undefined',
        '[object Symbol]': 'symbol',
        '[object Function]': 'function',
        '[object Date]': 'date',
        '[object Array]': 'array',
        '[object RegExp]': 'regexp',
      };
      const strKey = Object.prototype.toString.call(tmpData);
      return typeObj[strKey];
    };
    const typeKey = typeCheck(data);
    const list = [];
    const obj = {};
    if (typeof data === 'object') {
      if (typeKey === 'object') {
        // eslint-disable-next-line no-restricted-syntax, guard-for-in
        for (const o in data) {
          obj[o] = this.deepCopy(data[o]);
        }
        return obj;
      }
      if (typeKey === 'array') {
        data.forEach((item) => {
          list.push(this.deepCopy(item));
        });
        return list;
      }
      return data;
    }
    return data;
  },
  objToParam(obj) {
    const param = [];

    obj = obj || {};

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const p in obj) {
      param.push([p, encodeURIComponent(obj[p] ?? '')].join('='));
    }

    return param.length ? param.join('&') : '';
  },
  async ajax(store, params) {
    let res = null;
    const paramStr = this.objToParam(this.deepCopy(params));
    let lastUrl = store.url;

    store = store || {};

    try {
      if (store.dataFormat === 'jsonToFormData') {
        params = jsonToFormData(params);
      } else if (store.dataFormat === 'jsonStringify') {
        params = JSON.stringify(params);
      } else if (paramStr) {
        lastUrl =
          store.url + ((store.url || '').match(/\?/) ? '&' : '?') + paramStr;
      }

      res = await axios[store.method || 'get'](lastUrl, params);
    } catch (error) {
      useNotificationError(
        error?.response?.statusText || error?.message || '出错了'
      );
    }

    return res;
  },
  escapeStr(str) {
    if (str.length === 0) return '';

    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/\s/g, '&nbsp;');
    str = str.replace(/'/g, '&#39;');
    str = str.replace(/"/g, '&quot;');
    str = str.replace(/\//g, '&#x2f;');

    return str;
  },
  xss(str) {
    return str;
  },
};
