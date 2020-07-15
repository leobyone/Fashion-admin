import request from '@/utils/request'

export function getPermissions(token) {
  return request({
    url: '/permission/permissions-token',
    method: 'get',
    params: { token }
  })
}

