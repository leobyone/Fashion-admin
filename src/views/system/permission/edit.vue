<template>
  <permission-detail :is-edit="true" />
</template>

<script>
import PermissionDetail from './components/PermissionDetail'

export default {
  name: 'EditPermission',
  components: { PermissionDetail }
}
</script>

