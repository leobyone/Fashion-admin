import request from '@/utils/request'

export function getPermissions(token) {
  return request({
    url: '/permission/permissions-token',
    method: 'get',
    params: { token }
  })
}

export function fetchList(query) {
  return request({
    url: '/permission/pagelist',
    method: 'get',
    params: query
  })
}

export function getPermissionList(query) {
  return request({
    url: '/permission/list',
    method: 'get',
    params: query
  })
}

export function getPermissionTree(query) {
  return request({
    url: '/permission/tree',
    method: 'get',
    params: query
  })
}

export function assignPermission(data) {
  return request({
    url: '/permission/tree',
    method: 'post',
    data
  })
}

