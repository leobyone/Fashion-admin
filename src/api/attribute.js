import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/attribute/pagelist',
    method: 'get',
    params: query
  })
}

export function getAttributeList(query) {
  return request({
    url: '/attribute/list',
    method: 'get',
    params: query
  })
}

export function fetchAttribute(id) {
  return request({
    url: '/attribute',
    method: 'get',
    params: { id }
  })
}

export function addAttribute(data) {
  return request({
    url: '/attribute',
    method: 'post',
    data
  })
}

export function updateAttribute(data) {
  return request({
    url: '/attribute',
    method: 'put',
    data
  })
}

export function deleteAttribute(id) {
  return request({
    url: `/attribute/${id}`,
    method: 'delete',
    params: { id }
  })
}