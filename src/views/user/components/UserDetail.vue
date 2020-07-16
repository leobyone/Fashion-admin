<template>
  <div class="createPost-container">
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar '+ postForm.status">
        <el-button v-loading="loading" style="margin-left: 10px;" type="primary" @click="submitForm">提交</el-button>
        <el-button @click="goBack">返回列表</el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-form-item style="margin-bottom: 40px;" prop="LoginName" label="登录名">
          <el-input v-model="postForm.LoginName" :maxlength="100" name="name" required></el-input>
        </el-form-item>

        <el-form-item prop="Avatar" style="margin-bottom: 30px;" label="头像">
          <Upload v-model="postForm.Avatar" />
        </el-form-item>

        <el-form-item prop="Password" label="密码" v-if="id === 0">
          <el-input v-model="postForm.Password" show-password auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item prop="RoleIds" label="用户角色">
          <el-select v-model="roleIds" multiple placeholder="请选择">
            <el-option v-for="item in roleList" :key="item.value" :label="item.label" :value="item.value"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item prop="RealName" label="真实姓名">
          <el-input v-model="postForm.RealName" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item prop="Sex" label="性别">
          <el-radio-group v-model="postForm.Sex">
            <el-radio class="radio" :label="1">男</el-radio>
            <el-radio class="radio" :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="Age" label="年龄">
          <el-input-number v-model="postForm.Age" :min="0" :max="100"></el-input-number>
        </el-form-item>

        <el-form-item label-width="120px" prop="Birthday" label="出生日期">
          <el-date-picker v-model="postForm.Birthday" type="date" format="yyyy-MM-dd" placeholder="选择日期" />
        </el-form-item>

        <el-form-item prop="Address" label="现在住址">
          <el-input type="textarea" v-model="postForm.Address"></el-input>
        </el-form-item>

        <el-form-item prop="status" label="是否启用">
          <el-switch v-model="postForm.Status"></el-switch>
        </el-form-item>

        <el-form-item style="margin-bottom: 40px;" label-width="70px" label="备注">
          <el-input v-model="postForm.Remark" :rows="1" type="textarea" class="user-textarea" autosize
            placeholder="Please enter the remark" />
          <span v-show="contentShortLength" class="word-counter">{{ contentShortLength }}words</span>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Tinymce from "@/components/Tinymce";
import Upload from "@/components/Upload/SingleImage3";
import Sticky from "@/components/Sticky"; // 粘性header组件
import { validURL } from "@/utils/validate";
import { fetchUser, createUser, updateUser } from "@/api/user";

const defaultForm = {
  LoginName: "",
  RealName: "",
  Password: "",
  Status: 0,
  Age: 0,
  Sex: 0,
  Birthday: "",
  Address: "",
  Avatar: "",
  Remark: ""
};

export default {
  name: "UserDetail",
  components: {
    Upload,
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
      postForm: Object.assign({}, defaultForm),
      loading: false,
      userListOptions: [],
      rules: {
        LoginName: [
          { required: true, message: "请输入登录名", trigger: "blur" }
        ]
      },
      tempRoute: {}
    };
  },
  computed: {
    contentShortLength() {
      return this.postForm.Remark.length;
    },
    lang() {
      return this.$store.getters.language;
    }
  },
  created() {
    debugger
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
      fetchUser(id).then(response => {
        this.postForm = response.data;
        // just for test
        this.postForm.title += `   Article Id:${this.postForm.id}`;
        // set tagsview title
        this.setTagsViewTitle();
        // set page title
        this.setPageTitle();
      }).catch(err => {
        console.log(err);
      });
    },
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑用户" : "Edit User";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.postForm.id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit User";
      document.title = `${title} - ${this.postForm.id}`;
    },
    submitForm() {
      console.log(this.postForm);
      this.$refs.postForm.validate(valid => {
        if (valid) {
          this.loading = true;
          if (this.isEdit) {
            updateUser(this.postForm).then(response => {
              let { success, msg } = response;
              this.$notify({
                title: success ? "成功" : "失败",
                message: success ? "更新用户成功" : "更新用户失败",
                type: success ? "success" : "error",
                duration: 2000
              });
            });
          } else {
            createUser(this.postForm).then(response => {
              let { success, msg } = response;
              this.$notify({
                title: success ? "成功" : "失败",
                message: success ? "新增用户成功" : "新增用户失败",
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
      this.$router.push({ path: "/user/list" });
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
