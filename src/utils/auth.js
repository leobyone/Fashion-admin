import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const ExpireKey = 'Expires_in'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function setExpires_in(expire) {
  return Cookies.set(ExpireKey, expire)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function removeExpires_in() {
  return Cookies.remove(ExpireKey)
}
