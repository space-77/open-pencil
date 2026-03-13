const TokenKey = "Authorization";

/**
 * @description 获取 token
 */
export function getToken() {
  return localStorage.getItem(TokenKey) ?? undefined;
}

/**
 * @description 设置 token
 * @param token token
 */
export function setToken(token: string) {
  localStorage.setItem(TokenKey, token);
}

/**
 * @description 删除 token
 */
export function removeToken() {
  return localStorage.removeItem(TokenKey);
}

/**
 * @description 检测返回code是不是认证过去
 */
export function checkAuthCode(code: number) {
  return code === 401;
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params: any) {
  let result = "";
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = `${encodeURIComponent(propName)}=`;
    if (value !== null && value !== "" && typeof value !== "undefined") {
      if (typeof value === "object") {
        for (const key of Object.keys(value)) {
          if (
            value[key] !== null &&
            value[key] !== "" &&
            typeof value[key] !== "undefined"
          ) {
            const params = `${propName}[${key}]`;
            const subPart = `${encodeURIComponent(params)}=`;
            result += `${subPart + encodeURIComponent(value[key])}&`;
          }
        }
      } else {
        result += `${part + encodeURIComponent(value)}&`;
      }
    }
  }
  return result;
}
