<template>
  <el-card class="form-container" shadow="never" v-loading="loading">
    <el-form ref="permissionForm" :model="permissionForm" :rules="rules" label-width="150px">
      <el-form-item prop="Name" label="菜单名">
        <el-input v-model="permissionForm.Name" :maxlength="100" required></el-input>
      </el-form-item>

      <el-form-item prop="Path" label="路由">
        <el-input v-model="permissionForm.Path" :maxlength="200"></el-input>
      </el-form-item>

      <el-form-item prop="Component" label="页面地址">
        <el-input v-model="permissionForm.Component" :maxlength="200"></el-input>
      </el-form-item>

      <el-form-item prop="Redirect" label="跳转地址">
        <el-input v-model="permissionForm.Redirect" :maxlength="200"></el-input>
      </el-form-item>

      <el-form-item prop="Enabled" label="是否启用">
        <el-switch v-model="permissionForm.Enabled"></el-switch>
      </el-form-item>

      <el-form-item prop="IsButton" label="是否按钮">
        <el-switch v-model="permissionForm.IsButton"></el-switch>
      </el-form-item>

      <el-form-item prop="IsHide" label="是否隐藏">
        <el-switch v-model="permissionForm.IsHide"></el-switch>
      </el-form-item>

      <el-form-item label="描述">
        <el-input v-model="permissionForm.Description" :rows="3" type="textarea"
          placeholder="Please enter the description" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('permissionForm')">提交</el-button>
        <el-button @click="resetForm('permissionForm')" v-if="!isEdit">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
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
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      permissionForm: Object.assign({}, defaultForm),
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
        this.permissionForm = response.data.data;
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
        title: `${title}-${this.permissionForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Permission";
      document.title = `${title} - ${this.permissionForm.Id}`;
    },
    submitForm() {
      let that = this;
      that.$refs.permissionForm.validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updatePermission(that.permissionForm).then(response => {
              that.loading = false;
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "更新菜单成功",
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
            });
          } else {
            addPermission(this.permissionForm).then(response => {
              that.loading = false;
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "新增菜单成功",
                  type: "success",
                  duration: 1000
                });
                that.$router.back();
              } else {
                that.$message({
                  message: "新增菜单失败",
                  type: "error",
                  duration: 1000
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
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.permissionForm = Object.assign({}, this.defaultForm);
    }
  }
};
</script>