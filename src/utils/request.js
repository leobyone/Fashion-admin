import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import router from "@/router";
import { getToken } from '@/utils/auth'

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  // timeout: 5000 // request timeout
})

// 请求拦截
service.interceptors.request.use(
  config => {
    var curTime = new Date();
    var expiretime = new Date(Date.parse(store.getters.tokenExpire));

    if (store.getters.token && (expiretime && curTime < expiretime)) {
      // 判断是否存在token，如果存在的话并且还有效，则每个http header都加上token
      config.headers.Authorization = "Bearer " + getToken();
    }

    //保存token的刷新时间
    saveRefreshtime();

    return config
  },
  error => {
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

//http响应拦截
service.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // 超时请求处理
    var originalRequest = error.config;
    if (error.code == "ECONNABORTED"
      && error.message.indexOf("timeout") != -1
      && !originalRequest._retry) {
      Message({
        message: "请求超时",
        type: 'error',
        duration: 5 * 1000
      })

      originalRequest._retry = true;
      return null;
    }

    if (error.response) {
      if (error.response.status == 401) {
        var curTime = new Date();
        var refreshtime = new Date(Date.parse(window.localStorage.refreshtime));
        // 在用户操作的活跃期内
        if (window.localStorage.refreshtime && curTime <= refreshtime) {
          return store.dispatch('user/refreshToken', store.getters.token).then(res => {
              if (res.success) {
                Message({
                  message: "refreshToken success! loading data...",
                  type: 'success',
                  duration: 5 * 1000
                })

                store.commit("user/SET_TOKEN", res.token);

                var curTime = new Date();
                var expiredate = new Date(
                  curTime.setSeconds(curTime.getSeconds() + res.expires_in)
                );
                store.commit("user/SET_TOKEN_EXPIRE", expiredate);

                error.config.__isRetryRequest = true;
                error.config.headers.Authorization = "Bearer " + res.token;
                return axios(error.config);
              } else {
                // 刷新token失败 清除token信息并跳转到登录页面
                toLogin();
              }
            });
        } else {
          // 返回 401，并且不知用户操作活跃期内 清除token信息并跳转到登录页面
          toLogin();
        }
      }
      // 403 无权限
      if (error.response.status == 403) {
        Message({
          message: "失败！该操作无权限",
          type: 'error',
          duration: 5 * 1000
        })
        return null;
      }
    }
    return ""; // 返回接口返回的错误信息
  }
);

export const saveRefreshtime = () => {
  let nowtime = new Date();
  let lastRefreshtime = window.localStorage.refreshtime
    ? new Date(window.localStorage.refreshtime)
    : new Date(-1);
  let expiretime = new Date(Date.parse(window.localStorage.TokenExpire));

  let refreshCount = 1; //滑动系数
  if (lastRefreshtime >= nowtime) {
    lastRefreshtime = nowtime > expiretime ? nowtime : expiretime;
    lastRefreshtime.setMinutes(lastRefreshtime.getMinutes() + refreshCount);
    window.localStorage.refreshtime = lastRefreshtime;
  } else {
    window.localStorage.refreshtime = new Date(-1);
  }
};

const toLogin = () => {
  store.commit("user/SET_TOKEN", "");
  store.commit("user/SET_TOKEN_EXPIRE", "");

  router.replace({
    path: "/login",
    query: { redirect: router.currentRoute.fullPath }
  });

  window.location.reload();
};

export default service
