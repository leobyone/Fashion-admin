<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="roleName" :placeholder="'角色名'" style="width: 200px;" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left:10px;"
        @click="handleFilter">{{ $t('table.search') }}</el-button>
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
          <router-link :to="'/system/role/edit/'+scope.row.Id" class="link-type">
            <span>{{ scope.row.Name }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Enabled" width="110">
        <template slot-scope="scope">
          <el-tag :type="scope.row.Enabled ? 'success' : 'danger'">{{ scope.row.Enabled ? '正常' : '禁用' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Description">
        <template slot-scope="scope">
          <span>{{ scope.row.Description }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="300">
        <template slot-scope="scope">
          <router-link :to="'/system/role/edit/'+scope.row.Id">
            <el-button type="primary" size="small" icon="el-icon-edit">{{ $t('table.edit') }}</el-button>
          </router-link>
          <router-link :to="'/system/role/assign/'+scope.row.Id">
            <el-button type="warning" size="small" icon="el-icon-share" style="margin-left: 5px;">
              {{ $t('table.assign') }}</el-button>
          </router-link>
          <el-button size="small" type="danger" icon="el-icon-delete" style="margin-left: 5px;"
            @click="handleDelete(scope.row)">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit"
      @pagination="getList" />
  </div>
</template>

<script>
import { fetchList, deleteRole } from "@/api/role";
import util from "@/utils/util.js";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  name: "RoleList",
  components: { Pagination },
  filters: {},
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      roleName: "",
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
    roleName: function (newVal, oldVal) {
      let conditions = [
        {
          Field: "IsDeleted",
          DataType: util.query.dataType.boolean,
          Option: util.query.opt.eq,
          Value: false
        }
      ];

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
      this.$router.push({ path: "/system/role/create" });
    },
    handleDelete(row) {
      this.$confirm("您确定要执行该操作吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteRole(row.Id).then(response => {
          let { success, msg } = response.data;
          if (success) {
            this.$message({
              message: "删除成功",
              type: "success",
              duration: 1000
            });
            this.getList();
          } else {
            this.$message({
              message: msg,
              type: "error",
              duration: 1000
            });
          }
        });
      });
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    }
  }
};
</script>
