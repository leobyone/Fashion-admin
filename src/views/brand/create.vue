<template>
  <brand-detail :is-edit="false" />
</template>

<script>
import BrandDetail from './components/BrandDetail'

export default {
  name: 'EditBrand',
  components: { BrandDetail }
}
</script>

