import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/role/pagelist',
    method: 'get',
    params: query
  })
}

export function fetchRole(id) {
  return request({
    url: '/role',
    method: 'get',
    params: { id }
  })
}

export function getRoles(query) {
  return request({
    url: '/role/list',
    method: 'get',
    params: query
  })
}

export function addRole(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  })
}

export function updateRole(data) {
  return request({
    url: '/role',
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: '/role',
    method: 'delete',
    params: { id }
  })
}
