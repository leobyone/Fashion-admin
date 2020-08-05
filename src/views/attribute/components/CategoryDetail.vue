<template>
  <div class="createPost-container" v-loading="loading">
    <el-form ref="postForm" :model="postForm" :rules="rules" label-width="100px" class="form-container">
      <sticky :z-index="10" :class-name="'sub-navbar success'">
        <el-button style="margin-left: 10px;" type="success" size="small" @click="submitForm">提交
        </el-button>
        <el-button size="small" type="warning" @click="goBack">返回</el-button>
      </sticky>

      <div class="createPost-main-container">
        <el-form-item style="margin-bottom: 40px;" prop="Name" label="分类名称">
          <el-input v-model="postForm.Name" :maxlength="100" name="name" required></el-input>
        </el-form-item>

        <el-form-item prop="ParentId" style="margin-bottom: 30px;" label="上级分类">
          <el-select v-model="postForm.ParentId" multiple placeholder="请选择">
            <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item prop="IsShow" label="是否显示">
          <el-radio-group v-model="postForm.IsShow">
            <el-radio class="radio" :label="1">是</el-radio>
            <el-radio class="radio" :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item prop="Path" label="跳转地址">
          <el-input v-model="postForm.Path" auto-complete="off"></el-input>
        </el-form-item>

        <el-form-item prop="OrderSort" label="排序">
          <el-input v-model="postForm.OrderSort" type="number"></el-input>
        </el-form-item>

      </div>
    </el-form>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky"; // 粘性header组件
import { validURL } from "@/utils/validate";
import { fetchCategory, addCategory, updateCategory, getCategoryList } from "@/api/category";
import util from "@/utils/util.js";

const defaultForm = {
  Name: "",
  ParentId: null,
  IsShow: 0,
  Path: "",
  OrderSort: 0
};

export default {
  name: "CategoryDetail",
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
      categoryOptions: [],
      rules: {
        Name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
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
    this.getCategoryOptions();
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route);
  },
  methods: {
    fetchData(id) {
      fetchCategory(id).then(response => {
        this.postForm = response.data.data;
        // set tagsview title
        this.setTagsViewTitle();
        // set page title
        this.setPageTitle();
      }).catch(err => {
        console.log(err);
      });
    },
    getCategoryOptions() {
      let conditions = [{
        Field: "IsDeleted",
        DataType: util.query.dataType.boolean,
        Option: util.query.opt.eq,
        Value: false
      }];
      getCategoryList({ conditions: util.query.convert(conditions), sorts: [] }).then(response => {
        let { success, data } = response.data;
        if (success) {
          this.categoryOptions = data.map(t => {
            return {
              value: t.Id,
              label: t.Name
            }
          });
        } else {
          this.$message({ message: '加载分类列表失败', type: 'error' });
        }
      })
    },
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑分类" : "Edit Category";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.postForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Category";
      document.title = `${title} - ${this.postForm.Id}`;
    },
    submitForm() {
      let that = this;
      console.log(that.postForm);
      that.$refs.postForm.validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updateCategory(that.postForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$notify({
                  title: "提示",
                  message: "更新分类成功",
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
                message: "更新分类失败",
                type: "error",
                duration: 2000
              });
            });
          } else {
            addCategory(that.postForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$notify({
                  title: "提示",
                  message: "新增分类成功",
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
                message: "新增分类失败",
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
      this.$router.push({ path: "/system/category/list" });
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
