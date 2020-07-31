<template>
  <div class="createPost-container" v-loading="loading">
    <el-form ref="postForm" :model="postForm" :rules="rules" label-width="100px" class="form-container">
      <div class="createPost-main-container">
        <el-form-item style="margin-bottom: 40px;" prop="Name" label="商品名称">
          <el-input v-model="postForm.Name" :maxlength="100" required></el-input>
        </el-form-item>

        <el-form-item prop="CatePidArr" label="商品分类">
          <el-cascader v-model="postForm.CatePidArr" :options="cateOptions" :props="{ expandTrigger: 'hover' }">
          </el-cascader>
        </el-form-item>

        <el-form-item prop="BrandId" label="商品品牌">
          <el-select v-model="postForm.BrandId" placeholder="请选择">
            <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item prop="Description" label="商品介绍">
          <el-input v-model="postForm.Description" :rows="3" type="textarea" placeholder="请输入内容" />
        </el-form-item>

        <el-form-item prop="PSN" label="商品货号">
          <el-input v-model="postForm.PSN"></el-input>
        </el-form-item>

        <el-form-item prop="ShopPrice" label="商品售价">
          <el-input v-model="postForm.ShopPrice"></el-input>
        </el-form-item>

        <el-form-item prop="MarketPrice" label="市场价格">
          <el-input v-model="postForm.MarketPrice"></el-input>
        </el-form-item>

        <el-form-item prop="CostPrice" label="成本价格">
          <el-input v-model="postForm.CostPrice"></el-input>
        </el-form-item>

        <el-form-item prop="Weight" label="商品重量">
          <el-input v-model="postForm.Weight"></el-input>
        </el-form-item>

        <el-form-item prop="OrderSort" label="排序">
          <el-input v-model="postForm.OrderSort"></el-input>
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<script>
import Upload from "@/components/Upload/SingleImage3";
import Sticky from "@/components/Sticky"; // 粘性header组件
import { validURL } from "@/utils/validate";
import { fetchUser, addUser, updateUser } from "@/api/user";
import { getRoles } from "@/api/role";

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
      title: '',
      postForm: Object.assign({}, defaultForm),
      loading: false,
      roleIds: '',
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
        this.postForm = response.data.data;
        this.status = this.postForm.Status == 0 ? false : true;
        if (this.postForm.RoleIds) {
          this.roleIds = this.postForm.RoleIds.split(',').map(t => {
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
      getRoles({}).then(response => {
        let { success, data } = response.data;
        if (success) {
          this.roleList = data.map(t => {
            return {
              value: t.Id,
              label: t.Name
            }
          });
        } else {
          this.$message({ message: '加载角色列表失败', type: 'error' });
        }
      })
    },
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑用户" : "Edit User";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.postForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit User";
      document.title = `${title} - ${this.postForm.Id}`;
    },
    submitForm() {
      let that = this;
      console.log(that.postForm);
      that.$refs.postForm.validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updateUser(that.postForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$notify({
                  title: "提示",
                  message: "更新用户成功",
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
            }).catch(() => {
              that.$notify({
                title: "提示",
                message: "更新用户失败",
                type: "error",
                duration: 2000
              });
            });
          } else {
            addUser(that.postForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$notify({
                  title: "提示",
                  message: "新增用户成功",
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
            }).catch(() => {
              that.$notify({
                title: "提示",
                message: "新增用户失败",
                type: "error",
                duration: 2000
              });
            });
          }
          that.loading = false;
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    goBack() {
      this.$router.push({ path: "/system/user/list" });
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
