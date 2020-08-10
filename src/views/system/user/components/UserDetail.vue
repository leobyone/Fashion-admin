<template>
  <el-card class="form-container" shadow="never" v-loading="loading">
    <el-form ref="userForm" :model="userForm" :rules="rules" label-width="150px">
      <el-form-item prop="LoginName" label="登录名">
        <el-input v-model="userForm.LoginName" :maxlength="100" name="name" required></el-input>
      </el-form-item>

      <el-form-item prop="Avatar" label="头像">
        <Upload v-model="userForm.Avatar" />
      </el-form-item>

      <el-form-item prop="Password" label="密码" v-if="!isEdit">
        <el-input v-model="userForm.Password" show-password auto-complete="off"></el-input>
      </el-form-item>

      <el-form-item prop="RoleIds" label="用户角色">
        <el-select v-model="roleIds" multiple placeholder="请选择">
          <el-option v-for="item in roleList" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="RealName" label="真实姓名">
        <el-input v-model="userForm.RealName" auto-complete="off"></el-input>
      </el-form-item>

      <el-form-item prop="Sex" label="性别">
        <el-radio-group v-model="userForm.Sex">
          <el-radio class="radio" :label="1">男</el-radio>
          <el-radio class="radio" :label="2">女</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="Age" label="年龄">
        <el-input-number v-model="userForm.Age" :min="0" :max="100"></el-input-number>
      </el-form-item>

      <el-form-item prop="Birthday" label="出生日期">
        <el-date-picker v-model="userForm.Birthday" type="date" format="yyyy-MM-dd" placeholder="选择日期" />
      </el-form-item>

      <el-form-item prop="Address" label="现在住址">
        <el-input type="textarea" v-model="userForm.Address"></el-input>
      </el-form-item>

      <el-form-item prop="status" label="是否启用">
        <el-switch v-model="status"></el-switch>
      </el-form-item>

      <el-form-item label="备注">
        <el-input v-model="userForm.Remark" :rows="3" type="textarea" placeholder="Please enter the remark" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm('userForm')">提交
        </el-button>
        <el-button @click="resetForm('userForm')" v-if="!isEdit">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
import Upload from "@/components/Upload/SingleImage3";
import { validURL } from "@/utils/validate";
import { fetchUser, addUser, updateUser } from "@/api/user";
import { getRoles } from "@/api/role";
import util from "@/utils/util.js";

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
      userForm: Object.assign({}, defaultForm),
      loading: false,
      roleIds: "",
      roleList: [],
      status: 0,
      rules: {
        LoginName: [
          { required: true, message: "请输入登录名", trigger: "blur" }
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
    this.getRoles();
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route);
  },
  methods: {
    fetchData(id) {
      fetchUser(id).then(response => {
        this.userForm = response.data.data;
        this.status = this.userForm.Status == 0 ? false : true;
        if (this.userForm.RoleIds) {
          this.roleIds = this.userForm.RoleIds.split(',').map(t => {
            return parseInt(t);
          })
        }
        // set tagsview title
        this.setTagsViewTitle();
        // set page title
        this.setPageTitle();
      }).catch(err => {
        console.log(err);
      });
    },
    getRoles() {
      let conditions = [{
        Field: "IsDeleted",
        DataType: util.query.dataType.boolean,
        Option: util.query.opt.eq,
        Value: false
      }];

      getRoles({
        conditions: util.query.convert(conditions),
        sorts: util.query.convert([])
      }).then(response => {
        let { success, data } = response.data;
        if (success) {
          this.roleList = data.map(t => {
            return {
              value: t.Id,
              label: t.Name
            };
          });
        } else {
          this.$message({ message: "加载角色列表失败", type: "error" });
        }
      });
    },
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑用户" : "Edit User";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.userForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit User";
      document.title = `${title} - ${this.userForm.Id}`;
    },
    submitForm(formName) {
      let that = this;
      that.$refs[formName].validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updateUser(that.userForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                this.$refs.userForm.resetFields();
                that.$message({
                  message: "更新用户成功",
                  type: "success",
                  duration: 1000
                });
                this.$router.back();
              } else {
                that.$message({
                  message: msg,
                  type: "error",
                  duration: 1000
                });
              }
            }).catch(() => {
              that.$message({
                message: "更新用户失败",
                type: "error",
                duration: 1000
              });
            })
          } else {
            addUser(that.userForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "新增用户成功",
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
                message: "新增用户失败",
                type: "error",
                duration: 1000
              });
            }).then(() => {
              that.loading = false;
            })
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.userForm = Object.assign({}, this.defaultForm);
    }
  }
};
</script>
