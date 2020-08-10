<template>
  <attribute-detail :is-edit="false" />
</template>

<script>
import AttributeDetail from './components/AttributeDetail'

export default {
  name: 'EditAttribute',
  components: { AttributeDetail }
}
</script>

