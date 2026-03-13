import axios from 'axios'
import { setupCache } from 'axios-cache-interceptor'
import { BASE_URL, SuccessCode } from '@/config/index'
import { addRequestInterceptor } from './methods'

// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: BASE_URL,
  // 超时
  timeout: 1000 * 60 * 4,
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
  },
})

// 请求拦截器
addRequestInterceptor(setupCache(service, { ttl: 2000 }), SuccessCode)

export default service
