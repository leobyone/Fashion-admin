<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="categoryName" :placeholder="$t('table.categoryname')" style="width: 200px;" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left:10px;"
        @click="handleFilter">
        {{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
        @click="handleCreate">{{ $t('table.add') }}</el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.Id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="200px" label="Name">
        <template slot-scope="scope">
          <router-link :to="'/category/edit/' + scope.row.Id" class="link-type">
            <span>{{ scope.row.Name }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Layer">
        <template slot-scope="scope">
          {{ scope.row.Layer }}
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Path">
        <template slot-scope="scope">
          {{ scope.row.Path }}
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="IsShow">
        <template slot-scope="scope">
          <el-tag :type="scope.row.IsShow ? 'success' : 'info'">{{ scope.row.IsShow ? '显示' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="OrderSort">
        <template slot-scope="scope">
          <span>{{ scope.row.OrderSort }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit(scope.row)">
            {{ $t('table.edit') }}
          </el-button>
          <el-button size="small" type="danger" icon="el-icon-delete" style="margin-left: 5px;"
            @click="handleDelete(scope.row)">
            {{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, deleteCategory } from "@/api/category";
import util from "@/utils/util.js";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  name: "CategoryList",
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      categoryName: "",
      listQuery: {
        page: 1,
        size: 20,
        sorts: util.query.convert([{ Field: "CreationTime", SortBy: 1 }]),
        conditions: util.query.convert([
          {
            Field: "IsDeleted",
            DataType: util.query.dataType.boolean,
            Option: util.query.opt.eq,
            Value: false
          }
        ])
      }
    };
  },
  watch: {
    categoryName: function (newVal, oldVal) {
      let conditions = [{
        Field: "IsDeleted",
        DataType: util.query.dataType.boolean,
        Option: util.query.opt.eq,
        Value: false
      }];

      if (newVal != "") {
        conditions.push({
          Field: "Name",
          DataType: util.query.dataType.string,
          Option: util.query.opt.like,
          Value: newVal
        });
        this.listQuery.conditions = util.query.convert(conditions);
      } else {
        this.listQuery.conditions = util.query.convert(conditions);
      }

      this.getList();
    }
  },
  created() {
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        let { success, message, data } = response.data;
        if (success) {
          this.list = data.data;
          this.total = data.dataCount;
        } else {
          this.$message({ message: message, type: "error" });
        }

        this.listLoading = false;
      });
    },
    handleCreate() {
      this.$router.push({ path: "/category/create" });
    },
    handleEdit(row) {
      this.$router.push({ path: `/category/edit/${row.Id}` });
    },
    handleDelete(row) {
      deleteCategory(row.Id).then(response => {
        let { success, msg } = response.data;
        if (success) {
          this.$message({
            message: '删除成功',
            type: 'success',
            duration: 1000
          })
          this.getList();
        } else {
          this.$message({
            message: msg,
            type: 'error',
            duration: 1000
          })
        }
      })
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    }
  }
};
</script>
