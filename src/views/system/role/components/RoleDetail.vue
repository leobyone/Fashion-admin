<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" label-width="100px" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar '+ postForm.Status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="success" size="small" @click="submitForm">提交
        </el-button>
        <el-button size="small" type="warning" @click="goBack">返回</el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-form-item style="margin-bottom: 40px;" prop="Name" label="角色名">
          <el-input v-model="postForm.Name" :maxlength="100" name="name" required></el-input>
        </el-form-item>

        <el-form-item prop="Enabled" label="是否启用">
          <el-switch v-model="postForm.Enabled"></el-switch>
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
import Tinymce from "@/components/Tinymce";
import Sticky from "@/components/Sticky"; // 粘性header组件
import { fetchRole, addRole, updateRole } from "@/api/role";

const defaultForm = {
  Name: "",
  Enabled: false,
  Description: ""
};

export default {
  name: "RoleDetail",
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
      const title = this.lang === "zh" ? "编辑角色" : "Edit Role";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.postForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Role";
      document.title = `${title} - ${this.postForm.Id}`;
    },
    submitForm() {
      console.log(this.postForm);
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.isEdit) {
            updateRole(this.postForm).then(response => {
              let { success, msg } = response.data;
              this.$notify({
                title: "提示",
                message: success ? "更新角色成功" : "更新角色失败",
                type: success ? "success" : "error",
                duration: 2000
              });
            });
          } else {
            addRole(this.postForm).then(response => {
              let { success, msg } = response.data;
              this.$notify({
                title: "提示",
                message: success ? "新增角色成功" : "新增角色失败",
                type: success ? "success" : "error",
                duration: 2000
              });
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
      this.$router.push({ path: "/system/role/list" });
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
