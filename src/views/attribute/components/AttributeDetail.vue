<template>
  <el-card class="form-container" shadow="never" v-loading="loading">
    <el-form ref="attributeForm" :model="attributeForm" :rules="rules" label-width="150px">

      <div class="createPost-main-container">
        <el-form-item style="margin-bottom: 40px;" prop="Name" label="属性名称">
          <el-input v-model="attributeForm.Name" :maxlength="100" name="name" required></el-input>
        </el-form-item>

        <el-form-item prop="ParentId" style="margin-bottom: 30px;" label="属性组">
          <el-select v-model="attributeForm.AttributeGroupId" multiple placeholder="请选择">
            <el-option v-for="item in groupOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="属性是否可选:">
          <el-radio-group v-model="attributeForm.SelectType">
            <el-radio :label="0">唯一</el-radio>
            <el-radio :label="1">单选</el-radio>
            <el-radio :label="2">复选</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="属性值可选值列表:">
          <el-input :autosize="true" type="textarea" v-model="inputListFormat"></el-input>
        </el-form-item>

        <el-form-item prop="OrderSort" label="排序">
          <el-input v-model="attributeForm.OrderSort" type="number"></el-input>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm('attributeForm')">提交
          </el-button>
          <el-button @click="resetForm('attributeForm')" v-if="!isEdit">重置</el-button>
        </el-form-item>
      </div>
    </el-form>
  </el-card>
</template>

<script>
import { validURL } from "@/utils/validate";
import { fetchAttribute, addAttribute, updateAttribute, getAttributeList } from "@/api/attribute";
import { getAttributeGroupList } from "@/api/attribute-group";
import util from "@/utils/util.js";

const defaultForm = {
  Name: "",
  AttributeGroupId: null,
  SelectType: 0,
  Values: "",
  OrderSort: 0
};

export default {
  name: "AttributeDetail",
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: '',
      attributeForm: Object.assign({}, defaultForm),
      loading: false,
      groupOptions: [],
      rules: {
        Name: [
          { required: true, message: "请输入属性名称", trigger: "blur" }
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
    this.getGroupOptions();
    // Why need to make a copy of this.$route here?
    // Because if you enter this page and quickly switch tag, may be in the execution of the setTagsViewTitle function, this.$route is no longer pointing to the current page
    // https://github.com/PanJiaChen/vue-element-admin/issues/1221
    this.tempRoute = Object.assign({}, this.$route);
  },
  methods: {
    fetchData(id) {
      fetchAttribute(id).then(response => {
        this.attributeForm = response.data.data;
        // set tagsview title
        this.setTagsViewTitle();
        // set page title
        this.setPageTitle();
      }).catch(err => {
        console.log(err);
      });
    },
    getGroupOptions() {
      let conditions = [{
        Field: "IsDeleted",
        DataType: util.query.dataType.boolean,
        Option: util.query.opt.eq,
        Value: false
      }];
      getAttributeGroupList({ conditions: util.query.convert(conditions), sorts: [] }).then(response => {
        let { success, data } = response.data;
        if (success) {
          this.groupOptions = data.map(t => {
            return {
              value: t.Id,
              label: t.Name
            }
          });
        } else {
          this.$message({ message: '加载属性分组列表失败', type: 'error' });
        }
      })
    },
    setTagsViewTitle() {
      const title = this.lang === "zh" ? "编辑属性" : "Edit Attribute";
      const route = Object.assign({}, this.tempRoute, {
        title: `${title}-${this.attributeForm.Id}`
      });
      this.$store.dispatch("tagsView/updateVisitedView", route);
    },
    setPageTitle() {
      const title = "Edit Attribute";
      document.title = `${title} - ${this.attributeForm.Id}`;
    },
    submitForm() {
      let that = this;
      that.$refs.attributeForm.validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updateAttribute(that.attributeForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "更新属性成功",
                  type: "success",
                  duration: 1000
                });

                that.$router.back();
              } else {
                that.$notify({
                  title: "提示",
                  message: msg,
                  type: "error",
                  duration: 2000
                });
              }
            }).catch(() => {
              that.$message({
                message: "更新属性失败",
                type: "error",
                duration: 1000
              });
            });
          } else {
            addAttribute(that.attributeForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$message({
                  message: "新增属性成功",
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
                message: "新增属性失败",
                type: "error",
                duration: 1000
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
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.attributeForm = Object.assign({}, this.defaultForm);
    }
  }
};
</script>

