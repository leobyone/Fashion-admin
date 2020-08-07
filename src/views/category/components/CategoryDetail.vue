<template>
  <el-card class="form-container" shadow="never" v-loading="loading">
    <el-form ref="cateForm" :model="cateForm" :rules="rules" label-width="150px">

      <el-form-item prop="Name" label="分类名称">
        <el-input v-model="cateForm.Name" :maxlength="100" name="name" required></el-input>
      </el-form-item>

      <el-form-item prop="ParentId" label="上级分类">
        <el-select v-model="cateForm.ParentId" multiple placeholder="请选择">
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="IsShow" label="是否显示">
        <el-radio-group v-model="cateForm.IsShow">
          <el-radio class="radio" :label="1">是</el-radio>
          <el-radio class="radio" :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item prop="Path" label="跳转地址">
        <el-input v-model="cateForm.Path" auto-complete="off"></el-input>
      </el-form-item>

      <el-form-item prop="OrderSort" label="排序">
        <el-input v-model="cateForm.OrderSort" type="number"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('cateForm')">提交
        </el-button>
        <el-button @click="resetForm('cateForm')" v-if="!isEdit">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
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
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      cateForm: Object.assign({}, defaultForm),
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
        this.cateForm = response.data.data;
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
        title: `${title}-${this.cateForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Category";
      document.title = `${title} - ${this.cateForm.Id}`;
    },
    submitForm(formName) {
      let that = this;
      console.log(that.cateForm);
      that.$refs[formName].validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updateCategory(that.cateForm).then(response => {
              that.loading = false;
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "更新分类成功",
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
                message: "更新分类失败",
                type: "error",
                duration: 1000
              });
            });
          } else {
            addCategory(that.cateForm).then(response => {
              that.loading = false;
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "新增分类成功",
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
                message: "新增分类失败",
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
      this.cateForm = Object.assign({}, this.defaultForm);
    }
  }
};
</script>

