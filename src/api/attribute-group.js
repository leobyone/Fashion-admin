import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/attribute-group/pagelist',
    method: 'get',
    params: query
  })
}

export function getAttributeGroupList(query) {
  return request({
    url: '/attribute-group/list',
    method: 'get',
    params: query
  })
}

export function fetchAttributeGroup(id) {
  return request({
    url: '/attribute-group',
    method: 'get',
    params: { id }
  })
}

export function addAttributeGroup(data) {
  return request({
    url: '/attribute-group',
    method: 'post',
    data
  })
}

export function updateAttributeGroup(data) {
  return request({
    url: '/attribute-group',
    method: 'put',
    data
  })
}

export function deleteAttributeGroup(id) {
  return request({
    url: `/attribute-group/${id}`,
    method: 'delete',
    params: { id }
  })
}