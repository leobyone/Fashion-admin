import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/brand/pagelist',
    method: 'get',
    params: query
  })
}

export function getBrandList(query) {
  return request({
    url: '/brand/list',
    method: 'get',
    params: query
  })
}

export function fetchBrand(id) {
  return request({
    url: '/brand',
    method: 'get',
    params: { id }
  })
}

export function addBrand(data) {
  return request({
    url: '/brand',
    method: 'post',
    data
  })
}

export function updateBrand(data) {
  return request({
    url: '/brand',
    method: 'put',
    data
  })
}

export function deleteBrand(id) {
  return request({
    url: `/brand/${id}`,
    method: 'delete',
    params: { id }
  })
}