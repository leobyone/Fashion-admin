<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="permissionName" :placeholder="'菜单名'" style="width: 200px;" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-button class="filter-item" type="primary" icon="el-icon-search" style="margin-left:10px;"
        @click="handleFilter">
        {{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit"
        @click="handleCreate">{{ $t('table.add') }}</el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%" lazy
      :load="load" row-key="Id" :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      @current-change="handleSelect">
      <el-table-column align="center" label="ID" width="120">
        <template slot-scope="scope">
          <span>{{ scope.row.Id }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Name">
        <template slot-scope="{row}">
          <router-link :to="'/system/permission/edit/'+row.Id" class="link-type">
            <i class="fa" :class="row.Icon"></i>
            <span>{{ row.Name }}</span>
          </router-link>
        </template>
      </el-table-column>

      <el-table-column label="路由">
        <template slot-scope="scope">
          <span>{{ scope.row.Path }}</span>
        </template>
      </el-table-column>

      <el-table-column label="页面地址">
        <template slot-scope="scope">
          <span>{{ scope.row.Component }}</span>
        </template>
      </el-table-column>

      <el-table-column label="跳转地址">
        <template slot-scope="scope">
          <span>{{ scope.row.Redirect }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="'是否启用'">
        <template slot-scope="scope">
          <el-tag :type="scope.row.Enabled ? 'success' : 'danger'">
            {{scope.row.Enabled ? '是' : '否'}}</el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="是否按钮">
        <template slot-scope="scope">
          <el-tag :type="!scope.row.IsButton  ? 'success' : 'danger'" disable-transitions>
            {{!scope.row.IsButton ? "否" : "是"}}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="是否隐藏">
        <template slot-scope="scope">
          <el-tag :type="!scope.row.IsHide  ? 'success' : 'danger'" disable-transitions>
            {{!scope.row.IsHide ? "否" : "是"}}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="描述">
        <template slot-scope="scope">
          <span>{{ scope.row.Description }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="Actions" width="200">
        <template slot-scope="scope">
          <router-link :to="'/system/permission/edit/'+scope.row.Id">
            <el-button type="primary" size="mini" icon="el-icon-edit">{{ $t('table.edit') }}</el-button>
          </router-link>
          <el-button size="mini" type="danger" icon="el-icon-delete" style="margin-left: 5px;"
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
import { fetchList, getPermissionTree, deletePermission } from "@/api/permission";
import util from "@/utils/util.js";
import Pagination from "@/components/Pagination"; // Secondary package based on el-pagination

export default {
  name: "PermissionList",
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      permissionName: "",
      selectedRow: {},
      listQuery: {
        page: 1,
        size: 20,
        sorts: util.query.convert([{ Field: "CreationTime", SortBy: 1 }]),
        conditions: util.query.convert([
          {
            Field: "ParentId",
            DataType: util.query.dataType.int,
            Option: util.query.opt.eq,
            Value: 0
          }, {
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
    permissionName: function (newVal, oldVal) {
      let conditions = [{
        Field: "ParentId",
        DataType: util.query.dataType.int,
        Option: util.query.opt.eq,
        Value: 0
      }, {
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
    load(tree, treeNode, resolve) {
      getPermissionTree({ parentId: tree.Id }).then((res) => {
        resolve(res.data.data);
      });
    },
    handleCreate() {
      this.$router.push({ path: "/system/permission/create" });
    },
    handleDelete(row) {
      deletePermission(row.Id).then(response => {
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
  },
  handleSelect(val) {
    this.selectedRow = val
  },
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
