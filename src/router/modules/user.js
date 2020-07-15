import Layout from '@/layout'

const userRouter = {
  path: '/user',
  component: Layout,
  redirect: '/user/list',
  name: 'User',
  meta: {
    title: 'User',
    icon: 'table'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/user/list'),
      name: 'list',
      meta: { title: 'list' }
    }
  ]
}
export default tableRouter