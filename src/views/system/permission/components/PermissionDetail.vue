<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" label-width="100px" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar success'">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" size="small" @click="submitForm">提交
        </el-button>
        <el-button size="small" type="warning" @click="goBack">返回</el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-form-item style="margin-bottom: 40px;" prop="Name" label="菜单名">
          <el-input v-model="postForm.Name" :maxlength="100" required></el-input>
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" prop="Path" label="路由">
          <el-input v-model="postForm.Path" :maxlength="200"></el-input>
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" prop="Component" label="页面地址">
          <el-input v-model="postForm.Component" :maxlength="200"></el-input>
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" prop="Redirect" label="跳转地址">
          <el-input v-model="postForm.Redirect" :maxlength="200"></el-input>
        </el-form-item>

        <el-form-item prop="Enabled" label="是否启用">
          <el-switch v-model="postForm.Enabled"></el-switch>
        </el-form-item>

        <el-form-item prop="IsButton" label="是否按钮">
          <el-switch v-model="postForm.IsButton"></el-switch>
        </el-form-item>

        <el-form-item prop="IsHide" label="是否隐藏">
          <el-switch v-model="postForm.IsHide"></el-switch>
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" label="描述">
          <el-input v-model="postForm.Description" :rows="3" type="textarea"
            placeholder="Please enter the description" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky"; // 粘性header组件
import { fetchPermission, addPermission, updatePermission } from "@/api/permission";

const defaultForm = {
  Id: 0,
  Name: "",
  Path: "",
  Component: "",
  Redirect: "",
  Action: "",
  Code: "",
  Enabled: true,
  IsButton: false,
  IsHide: false,
  Description: ""
};

export default {
  name: "PermissionDetail",
  components: {
    Sticky
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
      postForm: Object.assign({}, defaultForm),
      loading: false,
      rules: {
        Name: [
          { required: true, message: "请输入菜单名", trigger: "blur" }
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
      fetchPermission(id).then(response => {
        this.postForm = response.data.data;

        // set tagsview title
        this.setTagsViewTitle();
        // set page title
        this.setPageTitle();
      }).catch(err => {
        console.log(err);
      });
    },
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑菜单" : "Edit Permission";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.postForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Permission";
      document.title = `${title} - ${this.postForm.Id}`;
    },
    submitForm() {
      let that = this;
      console.log(this.postForm);
      that.$refs.postForm.validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updatePermission(that.postForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$notify({
                  title: "提示",
                  message: "更新菜单成功",
                  type: "success",
                  duration: 2000
                });
                setTimeout(function () {
                  that.goBack();
                }, 2000);
              } else {
                that.$notify({
                  title: "提示",
                  message: msg,
                  type: "error",
                  duration: 2000
                });
              }
            });
          } else {
            addPermission(this.postForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$notify({
                  title: "提示",
                  message: "新增菜单成功",
                  type: "success",
                  duration: 2000
                });
                setTimeout(function () {
                  that.goBack();
                }, 2000);
              } else {
                that.$notify({
                  title: "提示",
                  message: "新增菜单失败",
                  type: "error",
                  duration: 2000
                });
              }
            });
          }
          this.loading = false;
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    goBack() {
      this.$router.push({ path: "/system/permission/list" });
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
