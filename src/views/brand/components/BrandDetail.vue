<template>
  <el-card class="form-container" shadow="never" v-loading="loading">
    <el-form ref="brandForm" :model="brandForm" :rules="rules" label-width="150px">
      <el-form-item prop="Name" label="品牌名称">
        <el-input v-model="brandForm.Name" :maxlength="100" name="name" required></el-input>
      </el-form-item>

      <el-form-item prop="Logo" label="品牌LOGO">
        <Upload v-model="brandForm.Logo" />
      </el-form-item>

      <el-form-item prop="IsShow" label="是否显示">
        <el-radio-group v-model="brandForm.IsShow">
          <el-radio class="radio" :label="1">是</el-radio>
          <el-radio class="radio" :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="OrderSort" label="排序">
        <el-input v-model="brandForm.OrderSort" type="number"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('brandForm')">提交
        </el-button>
        <el-button @click="resetForm('brandForm')" v-if="!isEdit">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import Upload from "@/components/Upload/SingleImage3";
import { validURL } from "@/utils/validate";
import { fetchBrand, addBrand, updateBrand, getBrandList } from "@/api/category";
import util from "@/utils/util.js";

const defaultForm = {
  Name: "",
  Logo: "",
  IsShow: 0,
  OrderSort: 0
};

export default {
  name: "BrandDetail",
  components: {
    Upload
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      brandForm: Object.assign({}, defaultForm),
      loading: false,
      rules: {
        Name: [
          { required: true, message: "请输入品牌名称", trigger: "blur" }
        ]
      },
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
      const id = this.$route.params && this.$route.params.id;
      this.fetchData(id);
    }

    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route);
  },
  methods: {
    fetchData(id) {
      fetchBrand(id).then(response => {
        this.brandForm = response.data.data;
        // set tagsview title
        this.setTagsViewTitle();
        // set page title
        this.setPageTitle();
      }).catch(err => {
        console.log(err);
      });
    },
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑品牌" : "Edit Brand";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.brandForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Brand";
      document.title = `${title} - ${this.brandForm.Id}`;
    },
    submitForm(formName) {
      let that = this;
      that.$refs[formName].validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updateBrand(that.brandForm).then(response => {
              that.loading = false;
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "更新品牌成功",
                  type: "success",
                  duration: 1000
                });

                that.$router.back();
              } else {
                that.$message({
                  message: msg,
                  type: "error",
                  duration: 1000
                });
              }
            }).catch(() => {
              that.$message({
                message: "更新品牌失败",
                type: "error",
                duration: 1000
              });
            });
          } else {
            addBrand(that.brandForm).then(response => {
              that.loading = false;
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "新增品牌成功",
                  type: "success",
                  duration: 1000
                });

                that.$router.back();
              } else {
                that.$message({
                  message: msg,
                  type: "error",
                  duration: 1000
                });
              }
            }).catch(() => {
              that.$message({
                message: "新增品牌失败",
                type: "error",
                duration: 1000
              });
            });
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.brandForm = Object.assign({}, this.defaultForm);
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
}
</style>
