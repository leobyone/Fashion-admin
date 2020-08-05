import request from '@/utils/request'

export function addPermission(data) {
  return request({
    url: '/permission',
    method: 'post',
    data
  })
}

export function updatePermission(data) {
  return request({
    url: '/permission',
    method: 'put',
    data
  })
}

export function deletePermission(id) {
  return request({
    url: '/permission',
    method: 'delete',
    params: {
      id
    }
  })
}

export function getPermissions(token) {
  return request({
    url: '/permission/permissions-token',
    method: 'get',
    params: {
      token
    }
  })
}

export function fetchList(query) {
  return request({
    url: '/permission/pagelist',
    method: 'get',
    params: query
  })
}

export function fetchPermission(id) {
  return request({
    url: '/permission',
    method: 'get',
    params: {
      id
    }
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

export function getPermissionIdsByRoleId(roleId) {
  return request({
    url: '/permission/permissionidsbyroleid',
    method: 'get',
    params: {
      roleId
    }
  })
}

export function getPermissionListByUserId(userId) {
  return request({
    url: '/permission/permissionlistbyuserid',
    method: 'get',
    params: {
      userId
    }
  })
}