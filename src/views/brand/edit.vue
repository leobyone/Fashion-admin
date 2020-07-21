<template>
  <brand-detail :is-edit="true" />
</template>

<script>
import BrandDetail from './components/BrandDetail'

export default {
  name: 'EditBrand',
  components: { BrandDetail }
}
</script>

