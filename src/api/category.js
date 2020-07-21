import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/category/pagelist',
    method: 'get',
    params: query
  })
}

export function getCategoryList(query) {
  return request({
    url: '/category/list',
    method: 'get',
    params: query
  })
}

export function fetchCategory(id) {
  return request({
    url: '/category',
    method: 'get',
    params: { id }
  })
}

export function addCategory(data) {
  return request({
    url: '/category',
    method: 'post',
    data
  })
}

export function updateCategory(data) {
  return request({
    url: '/category',
    method: 'put',
    data
  })
}

export function deleteCategory(id) {
  return request({
    url: `/category/${id}`,
    method: 'delete',
    params: { id }
  })
}