import type { AxiosInstance } from "axios";
import { getToken, removeToken, tansParams } from "@/utils/auth";
import { LoginUrl } from "@/config";
import cache from "@/utils/cache";

// 是否显示重新登录
export const isRelogin = { show: false, message: "" };

export function addRequestInterceptor(
  service: AxiosInstance,
  successCode: number,
) {
  // request拦截器
  service.interceptors.request.use(
    (config) => {
      // 是否需要防止数据重复提交

      const isRepeatSubmit = config.headers.repeatSubmit === false;
      config.headers.set("Authorization", `Bearer ${getToken()}`);

      // get请求映射params参数
      if (config.method === "get" && config.params) {
        let url = `${config.url}?${tansParams(config.params)}`;
        url = url.slice(0, -1);
        config.params = {};
        config.url = url;
      }
      if (
        !isRepeatSubmit &&
        (config.method === "post" || config.method === "put")
      ) {
        const requestObj = {
          url: config.url,
          data:
            typeof config.data === "object"
              ? JSON.stringify(config.data)
              : config.data,
          time: new Date().getTime(),
        };
        const sessionObj = cache.session.getJSON("sessionObj");
        if (
          sessionObj === undefined ||
          sessionObj === null ||
          sessionObj === ""
        ) {
          cache.session.setJSON("sessionObj", requestObj);
        } else {
          const s_url = sessionObj.url; // 请求地址
          const s_data = sessionObj.data; // 请求数据
          const s_time = sessionObj.time; // 请求时间
          const interval = 1000; // 间隔时间(ms)，小于此时间视为重复提交
          const { data, time, url } = requestObj;
          if (s_data === data && time - s_time < interval && s_url === url) {
            const message = "数据正在处理，请勿重复提交";
            console.warn(`[${s_url}]: ${message}`);
            return Promise.reject(new Error(message));
          }
          cache.session.setJSON("sessionObj", requestObj);
        }
      }
      return config;
    },
    (error) => {
      console.log(error);
      Promise.reject(error);
    },
  );

  // 响应拦截器
  service.interceptors.response.use(
    async (res) => {
      const axiosData = res.data ?? {};

      // 未设置状态码则默认成功状态
      const code = axiosData.code;

      // 二进制数据则直接返回
      if (
        res.request?.responseType === "blob" ||
        res.request?.responseType === "arraybuffer"
      ) {
        return res as any;
      }
      if (code === 401) {
        const message = "登录状态已过期，您可以继续留在该页面，或者重新登录";
        if (
          (!isRelogin.show || isRelogin.message !== message) &&
          location.pathname !== LoginUrl
        ) {
          isRelogin.show = true;
          isRelogin.message = message;

          try {
            removeToken();
            window.location.href = LoginUrl;
          } catch (error) {
            console.log(error);
          }
          isRelogin.show = false;
          isRelogin.message = "";
        }
        return [
          { message: "无效的会话，或者会话已过期，请重新登录。" },
          axiosData.data,
          axiosData,
        ];
      }
      // else if (code !== successCode) ElNotification.error({ title: msg });
      if (code !== successCode) return [res.data, axiosData.data, axiosData];

      return [null, axiosData.data, axiosData];
    },
    (error) => {
      const { message: msg, response = {} } = error;
      let message = response.data?.message || response.data?.msg || msg;

      if (message === "Network Error") {
        message = "后端接口连接异常";
      } else if (message.includes("timeout")) {
        message = "系统接口请求超时";
      } else if (message.includes("Request failed with status code")) {
        message = `系统接口${message.substr(message.length - 3)}异常`;
      }
      // ElMessage({ message, type: "error", duration: 5 * 1000, key: message });
      return [Promise.reject(error), response.data, response];
    },
  );
}
