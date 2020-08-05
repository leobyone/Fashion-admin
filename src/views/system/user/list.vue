<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="userName"
        :placeholder="$t('table.username')"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        style="margin-left:10px;"
        @click="handleFilter"
      >{{ $t('table.search') }}</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >{{ $t('table.add') }}</el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.Id }}</span>
        </template>
      </el-table-column>

      <el-table-column min-width="200px" label="LoginName">
        <template slot-scope="{row}">
          <router-link :to="'/system/user/edit/'+row.Id" class="link-type">
            <span>{{ row.LoginName }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Sex">
        <template slot-scope="scope">
          <el-tag :type="scope.row.Sex | sexFilter">{{ scope.row.Sex | formatSex }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Age">
        <template slot-scope="scope">
          <span>{{ scope.row.Age }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Mobile">
        <template slot-scope="scope">
          <span>{{ scope.row.Mobile }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="Birthday">
        <template slot-scope="scope">
          <span>{{ scope.row.Birthday | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="Address">
        <template slot-scope="scope">
          <span>{{ scope.row.Address }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="Status" width="110">
        <template slot-scope="scope">
          <el-tag :type="scope.row.Status | statusFilter">{{ scope.row.Status | formatStatus }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="200">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="small"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
          >{{ $t('table.edit') }}</el-button>
          <el-button
            size="small"
            type="danger"
            icon="el-icon-delete"
            style="margin-left: 5px;"
            @click="handleDelete(scope.row)"
          >{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchList, deleteUser } from "@/api/user";
import util from "@/utils/util.js";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  name: "UserList",
  components: { Pagination },
  filters: {
    // el-tag类型转换
    statusFilter(status) {
      const statusMap = {
        1: "success",
        0: "danger"
      };
      return statusMap[status];
    },
    // el-tag类型转换
    sexFilter(sex) {
      const sexMap = {
        0: "danger",
        1: "success",
        2: "info"
      };
      return sexMap[sex];
    },
    // 状态显示转换
    formatStatus(status) {
      const statusMap = {
        0: "禁用",
        1: "正常"
      };
      return statusMap[status];
    },
    // 性别显示转换
    formatSex(sex) {
      const sexMap = {
        0: "未知",
        1: "男",
        2: "女"
      };
      return sexMap[sex];
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      userName: "",
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
    userName: function(newVal, oldVal) {
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
          Field: "LoginName",
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
      this.$router.push({ path: "/system/user/create" });
    },
    handleEdit(row) {
      this.$router.push({ path: `/system/user/edit/${row.Id}` });
    },
    handleDelete(row) {
      this.$confirm("您确定要执行该操作吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        deleteUser(row.Id).then(response => {
          let { success, msg } = response.data;
          if (success) {
            this.$notify({
              title: "提示",
              message: "删除成功",
              type: "success",
              duration: 2000
            });
            this.getList();
          } else {
            this.$notify({
              title: "提示",
              message: msg,
              type: "error",
              duration: 2000
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
