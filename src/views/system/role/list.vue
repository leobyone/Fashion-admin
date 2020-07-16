<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="roleName" :placeholder="'角色名'" style="width: 200px;" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
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

      <el-table-column min-width="300px" label="Name">
        <template slot-scope="{row}">
          <router-link :to="'/system/role/edit/'+row.Id" class="link-type">
            <span>{{ row.Name }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Enabled" width="110">
        <template slot-scope="scope">
          <el-tag :type="scope.row.Enabled | EnabledFilter">{{ scope.row.Enabled | formatEnabled }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Description">
        <template slot-scope="scope">
          <span>{{ scope.row.Description }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <router-link :to="'/system/user/edit/'+scope.row.Id">
            <el-button type="primary" size="mini" icon="el-icon-edit">Edit</el-button>
          </router-link>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">
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
import { fetchList, deleteRole } from "@/api/role";
import util from "@/utils/util.js";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  name: "RoleList",
  components: { Pagination },
  filters: {
    // el-tag类型转换
    enabledFilter(enabled) {
      const enabledMap = {
        0: "danger",
        1: "success"
      };
      return enabledMap[enabled];
    },
    // 状态显示转换
    formatEnabled(enabled) {
      const enabledMap = {
        0: "禁用",
        1: "正常"
      };
      return enabledMap[enabled];
    }
  },
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
      if (newVal != "") {
        let conditions = [
          {
            Field: "IsDeleted",
            DataType: util.query.dataType.boolean,
            Option: util.query.opt.eq,
            Value: false
          },
          {
            Field: "Name",
            DataType: util.query.dataType.str,
            Option: util.query.opt.eq,
            Value: newVal
          }
        ];

        this.listQuery.conditions = util.query.convert(conditions);
      }
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
      deleteRole(row.Id).then(response => {
        let { success, msg } = response.data;
        if (success) {
          this.$notify({
            title: '提示',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList();
        } else {
          this.$notify({
            title: '提示',
            message: msg,
            type: 'error',
            duration: 2000
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

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
