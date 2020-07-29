import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/product/pagelist',
    method: 'get',
    params: query
  })
}

export function getProductList(query) {
  return request({
    url: '/product/list',
    method: 'get',
    params: query
  })
}

export function fetchProduct(id) {
  return request({
    url: '/product',
    method: 'get',
    params: { id }
  })
}

export function addProduct(data) {
  return request({
    url: '/product',
    method: 'post',
    data
  })
}

export function updateProduct(data) {
  return request({
    url: '/product',
    method: 'put',
    data
  })
}

export function deleteProduct(id) {
  return request({
    url: `/product/${id}`,
    method: 'delete',
    params: { id }
  })
}