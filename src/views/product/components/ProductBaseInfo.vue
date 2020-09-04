<template>
  <div style="margin-top: 50px" v-loading="loading">
    <el-form :model="productForm" :rules="rules" ref="productForm" label-width="120px" style="width: 600px"
      size="small">
      <el-form-item style="margin-bottom: 40px;" prop="Name" label="商品名称">
        <el-input v-model="productForm.Name" :maxlength="100" required></el-input>
      </el-form-item>

      <el-form-item prop="CatePidArr" label="商品分类">
        <el-cascader v-model="productForm.CatePidArr" :options="cateOptions" :props="{ expandTrigger: 'hover' }">
        </el-cascader>
      </el-form-item>

      <el-form-item prop="BrandId" label="商品品牌">
        <el-select v-model="productForm.BrandId" placeholder="请选择">
          <el-option v-for="item in brandOptions" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="Description" label="商品介绍">
        <el-input v-model="productForm.Description" :rows="3" type="textarea" placeholder="请输入内容" />
      </el-form-item>

      <el-form-item prop="PSN" label="商品货号">
        <el-input v-model="productForm.PSN"></el-input>
      </el-form-item>

      <el-form-item prop="ShopPrice" label="商品售价">
        <el-input v-model="productForm.ShopPrice"></el-input>
      </el-form-item>

      <el-form-item prop="MarketPrice" label="市场价格">
        <el-input v-model="productForm.MarketPrice"></el-input>
      </el-form-item>

      <el-form-item prop="CostPrice" label="成本价格">
        <el-input v-model="productForm.CostPrice"></el-input>
      </el-form-item>

      <el-form-item prop="Weight" label="商品重量">
        <el-input v-model="productForm.Weight"></el-input>
      </el-form-item>

      <el-form-item label="计量单位：">
        <el-input v-model="productForm.Unit"></el-input>
      </el-form-item>

      <el-form-item prop="OrderSort" label="排序">
        <el-input v-model="productForm.OrderSort"></el-input>
      </el-form-item>

      <el-form-item style="text-align: center">
        <el-button type="primary" size="medium" @click="handleNext('productForm')">下一步，填写商品属性</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { fetchProduct, addProduct, updateProduct } from "@/api/product";
import { getCategoryList } from "@/api/category";
import { getBrandList } from "@/api/brand";
import util from "@/utils/util.js";

const defaultForm = {
  PSN: "",
  Name: "",
  CategoryId: null,
  BrandId: null,
  SKUGid: null,
  ShopPrice: 0,
  MarketPrice: 0,
  CostPrice: 0,
  Status: 0,
  Weight: 0,
  Description: "",
  OrderSort: 0
};

export default {
  name: "ProductDetail",
  props: {
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      productForm: Object.assign({}, defaultForm),
      loading: false,
      cateList: [],
      cateOptions: [],
      brandList: [],
      brandOptions: [],
      rules: {
        Name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
          { min: 2, max: 140, message: '长度在 2 到 140 个字符', trigger: 'blur' }
        ],
        CategoryId: [{ required: true, message: '请选择商品分类', trigger: 'blur' }],
        BrandId: [{ required: true, message: '请选择商品品牌', trigger: 'blur' }],
        Description: [{ required: true, message: '请输入商品介绍', trigger: 'blur' }],
        requiredProp: [{ required: true, message: '该项为必填项', trigger: 'blur' }]
      }
    };
  },
  created() {
    if (this.isEdit) {
      const id = this.$route.params && this.$route.params.id;
      this.fetchData(id);
    }
    this.getCates();
    this.getBrands();
  },
  methods: {
    fetchData(id) {
      fetchProduct(id).then(response => {
        this.productForm = response.data.data;
      }).catch(err => {
        console.log(err);
      });
    },
    getCates() {//获取商品分类
      let that = this;
      let conditions = [{
        Field: "IsDeleted",
        DataType: util.query.dataType.boolean,
        Option: util.query.opt.eq,
        Value: false
      }];

      getCategoryList({
        conditions: util.query.convert(conditions),
        sorts: util.query.convert([])
      }).then(response => {
        let { success, data } = response.data;
        if (success) {
          that.cateOptions = [];
          that.cateList = data.list;
          let filterList = data.list.filter(t => {
            return t.ParentID == 0;
          });

          filterList.forEach((item, index) => {
            let temp = {
              value: item.Id,
              label: item.Name,
              children: []
            }

            that.cateOptions.push(temp);
            that.groupCate(temp);
          })
        } else {
          that.$message({ message: '加载商品分类失败', type: 'error' });
        }
      })
    },
    //递归
    groupCate(parent) {
      let that = this;
      let list = [];

      list = that.cateList.filter((t) => {
        return t.ParentId == parent.Id;
      });

      list.forEach((item, index) => {
        let temp = {
          value: item.Id,
          label: item.Name,
          children: []
        }

        parent.children.push(temp);
        that.groupCate(temp);
      })
    },
    getBrands() {//获取商品品牌
      let that = this;
      let conditions = [{
        Field: "IsDeleted",
        DataType: util.query.dataType.boolean,
        Option: util.query.opt.eq,
        Value: false
      }];

      getBrandList({
        conditions: util.query.convert(conditions),
        sorts: util.query.convert([])
      }).then(response => {
        let { success, data } = response.data;
        if (success) {
          that.brandOptions = data.list.map(t => {
            return { value: t.Id, label: t.Name }
          })
        }
      })
    },
    handleNext(formName) {
      let that = this;
      that.$refs[formName].validate(valid => {
        if (valid) {
          that.loading = true;
          if (that.isEdit) {
            updateProduct(that.productForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$emit('next');
              } else {
                that.$message({
                  message: msg,
                  type: "error",
                  duration: 1000
                });

                return false;
              }
            }).catch(() => {
              that.$message({
                message: "更新失败",
                type: "error",
                duration: 1000
              });
            });
          } else {
            addProduct(that.productForm).then(response => {
              let { success, msg } = response.data;
              if (success) {
                that.$emit('next');
              } else {
                that.$message({
                  message: msg,
                  type: "error",
                  duration: 1000
                });
              }
            }).catch(() => {
              that.$message({
                message: "新增失败",
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
    }
  }
};
</script>