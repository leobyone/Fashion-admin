<template>
  <el-card class="form-container" shadow="never" v-loading="loading">
    <el-form ref="roleForm" :model="roleForm" :rules="rules" label-width="150px">
      <el-form-item prop="Name" label="角色名">
        <el-input v-model="roleForm.Name" :maxlength="100" name="name" required></el-input>
      </el-form-item>

      <el-form-item prop="Enabled" label="是否启用">
        <el-switch v-model="roleForm.Enabled"></el-switch>
      </el-form-item>

      <el-form-item label="描述">
        <el-input v-model="roleForm.Description" :rows="3" type="textarea" placeholder="Please enter the description" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('roleForm')">提交
        </el-button>
        <el-button @click="resetForm('roleForm')" v-if="!isEdit">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import { fetchRole, addRole, updateRole } from "@/api/role";

const defaultForm = {
  Name: "",
  Enabled: false,
  Description: ""
};

export default {
  name: "RoleDetail",
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      roleForm: Object.assign({}, defaultForm),
      loading: false,
      rules: {
        Name: [
          { required: true, message: "请输入角色名", trigger: "blur" }
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
      fetchRole(id).then(response => {
        this.roleForm = response.data.data;

        // set tagsview title
        this.setTagsViewTitle();
        // set page title
        this.setPageTitle();
      }).catch(err => {
        console.log(err);
      });
    },
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑角色" : "Edit Role";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.roleForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Role";
      document.title = `${title} - ${this.roleForm.Id}`;
    },
    submitForm(formName) {
      let that = this;
      that.$refs[formName].validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updateRole(that.roleForm).then(response => {
              that.loading = false;
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "更新角色成功",
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
            addRole(that.roleForm).then(response => {
              that.loading = false;
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "新增角色成功",
                  type: "success",
                  duration: 1000
                });
                that.$router.back();
              } else {
                that.$message({
                  message: "新增角色失败",
                  type: "error",
                  duration: 1000
                });
              }
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
      this.roleForm = Object.assign({}, this.defaultForm);
    }
  }
};
</script>