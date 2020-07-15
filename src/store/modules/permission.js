import { constantRoutes } from '@/router'
import { getPermissions } from '@/api/permission'
import Layout from '@/layout'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
// export function filterAsyncRoutes(routes, roles) {
//   const res = []

//   routes.forEach(route => {
//     const tmp = { ...route }
//     if (hasPermission(roles, tmp)) {
//       if (tmp.children) {
//         tmp.children = filterAsyncRoutes(tmp.children, roles)
//       }
//       res.push(tmp)
//     }
//   })

//   return res
// }
export function filterAsyncRoutes(routers) {
  // 遍历后台传来的路由字符串，转换为组件对象
  let accessedRouters = routers.filter(router => {
    if (router.meta) {
      // 默认图标处理
      router.meta.icon = router.meta.icon ? router.meta.icon : "component";
    }

    if (router.component) {
      if (router.component === "Layout") {
        router.component = Layout
      } else {
        //处理组件---重点
        router.component = loadView(router.component);
      }
    }

    //存在子集
    if (router.children && router.children.length) {
      router.children = filterAsyncRoutes(router.children);
    }

    return true;
  });

  return accessedRouters;
}

export function loadView (path) {
  return function (resolve) {
    require([`@/views/${path}.vue`], resolve)
  }
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  // generateRoutes({ commit }, roles) {
  //   return new Promise(resolve => {
  //     let accessedRoutes
  //     if (roles.includes('admin')) {
  //       accessedRoutes = asyncRoutes || []
  //     } else {
  //       accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
  //     }
  //     commit('SET_ROUTES', accessedRoutes)
  //     resolve(accessedRoutes)
  //   })
  // },
  generateRoutes({ commit, state }, token) {
    return new Promise((resolve, reject) => {
      getPermissions(token).then(response => {

        if (!response.data) {
          reject('Verification failed, please Login again.')
        }

        const { data, message, success } = response.data

        // roles must be a non-empty array
        if (!success) {
          reject(message)
        }

        let accessedRoutes
        accessedRoutes = filterAsyncRoutes(data)

        commit('SET_ROUTES', accessedRoutes)
        resolve(accessedRoutes)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
