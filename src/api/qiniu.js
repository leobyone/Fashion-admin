import request from '@/utils/request'

export function uploadImg(params, conf) {
  return request({
    url: 'upload/upload-image', 
    method: 'post',
    params,
    conf
  })
}

