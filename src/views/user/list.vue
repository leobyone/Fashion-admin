<template>
  <div class="app-container">
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

      <el-table-column min-width="300px" label="LoginName">
        <template slot-scope="{row}">
          <router-link :to="'/user/edit/'+row.id" class="link-type">
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

      <el-table-column align="center" label="Actions" width="120">
        <template slot-scope="scope">
          <router-link :to="'/user/edit/'+scope.row.Id">
            <el-button type="primary" size="small" icon="el-icon-edit">Edit</el-button>
          </router-link>
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
import { fetchList } from "@/api/user";
import util from '@/utils/util.js'
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  name: "UserList",
  components: { Pagination },
  filters: {
    // el-tag类型转换
    statusFilter(status) {
      const statusMap = {
        2: "info",
        4: "danger",
        5: "success"
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
  created() {
    debugger
    this.getList();
  },
  methods: {
    getList() {
      this.listLoading = true;
      fetchList(this.listQuery).then(response => {
        let { success, message, data } = response.data;
        if (success) {
          this.list = data.list.data;
          this.total = data.list.pageCount;
        } else {
          this.$message({ message: message, type: "error" });
        }

        this.listLoading = false;
      });
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
