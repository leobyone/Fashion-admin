<template>
  <div class="createPost-container">
    <el-steps :active="active" finish-status="success">
      <el-step title="填写商品信息"></el-step>
      <el-step title="填写商品属性"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>

    <product-base-info :id="id" @callBack="callBack" v-show="active == 0"></product-base-info>
    <product-properties :id="id" @callBack="callBack" v-show="active == 1"></product-properties>

    <el-button type="primary" style="margin-top: 12px;" @click="next" v-show="active == 0">下一步，填写商品属性</el-button>
    <el-button style="margin-top: 12px;" @click="pre" v-show="active == 1">上一步，填写商品信息</el-button>
    <el-button type="primary" style="margin-top: 12px;" @click="onSubmit" v-show="active == 1">完成，提交商品</el-button>
  </div>
</template>

<script>
import ProductBaseInfo from './ProductBaseInfo';
import ProductProperties from './ProductProperties';

export default {
  name: "ProductDetail",
  components: {
    ProductBaseInfo,
    ProductProperties
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      id: 0,
      active: 0,
      tempRoute: {}
    };
  },
  computed: {
    lang() {
      return this.$store.getters.language;
    }
  },
  created() {
    if (this.isEdit) {
      this.id = this.$route.params && this.$route.params.id;
    }

    // set tagsview title
    this.setTagsViewTitle();
    // set page title
    this.setPageTitle();

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route);
  },
  methods: {
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑商品" : "Edit Product";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Product";
      document.title = `${title} - ${this.id}`;
    },
    next() {
      this.active++;
    },
    pre() {
      this.active--;
    },
    onSubmit() {

    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";

.createPost-container {
  position: relative;

  .createPost-main-container {
    padding: 40px 45px 20px 50px;

    .postInfo-container {
      position: relative;
      @include clearfix;
      margin-bottom: 10px;

      .postInfo-container-item {
        float: left;
      }
    }
  }

  .word-counter {
    width: 40px;
    position: absolute;
    right: 10px;
    top: 0px;
  }
}

.user-textarea /deep/ {
  textarea {
    padding-right: 40px;
    resize: none;
    border: none;
    border-radius: 0px;
    border-bottom: 1px solid #bfcbd9;
  }
}
</style>
