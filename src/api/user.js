import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/token',
    method: 'get',
    params: data
  })
}

export function refreshToken(token) {
  return request({
    url: '/auth/refreshToken',
    method: 'get',
    params: { token }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function fetchList(query) {
  return request({
    url: '/user/pagelist',
    method: 'get',
    params: query
  })
}
