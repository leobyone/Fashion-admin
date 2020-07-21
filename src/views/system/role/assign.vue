<template>
  <div class="createPost-container">
    <sticky :z-index="10" :class-name="'sub-navbar success'">
      <el-button v-loading="loading" style="margin-left: 10px;" type="success" size="small" @click="submitForm">提交
      </el-button>
      <el-button size="small" type="warning" @click="goBack">返回</el-button>
    </sticky>
    <div class="createPost-main-container">
      <el-tree :data="treeData" show-checkbox node-key="id" ref="tree" :expand-on-click-node="true"
        :check-strictly="true">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span>
          <span>
            <el-checkbox v-for="btn in data.btns" :key="btn.value" :label="btn.label" :checked="isChecked(btn.value)"
              @change="checkboxChange(btn.value)">
            </el-checkbox>
          </span>
        </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import Sticky from "@/components/Sticky"; // 粘性header组件
import { getPermissionIdsByRoleId, getPermissionList, assignPermission } from "@/api/permission";
import util from "@/utils/util.js";

export default {
  name: "AssignPermission",
  components: {
    Sticky
  },
  data() {
    return {
      permissionList: [],
      treeData: [],
      roleId: 0,
      loading: false,
      assignBtns: [],
      assignBtnIds: []
    }
  },
  methods: {
    isChecked(id) {
      let flag = false;
      if (this.assignBtns.length > 0) {
        this.assignBtns.forEach(item => {
          if (item.Id == id) {
            flag = true;
          }
        });
      }
      return flag;
    },
    checkboxChange(val) {
      let idx = this.assignBtnIds.indexOf(val);
      if (idx > -1) {
        this.assignBtnIds.splice(idx, 1);
      } else {
        this.assignBtnIds.push(val);
      }
    },
    // 获取菜单列表
    getPermissionList(rid) {
      let that = this;
      let promises = [];

      promises.push(getPermissionIdsByRoleId(rid));

      let conditions = [{
        Field: "IsDeleted",
        DataType: util.query.dataType.boolean,
        Option: util.query.opt.eq,
        Value: false
      }];

      promises.push(getPermissionList({ conditions: util.query.convert(conditions), sorts: [] }));

      Promise.all(promises).then(res => {
        debugger
        let ret1 = res[0].data;
        that.$refs.tree.setCheckedKeys(ret1.data.PermissionIds);
        if (ret1.data.AssignBtns) {
          that.assignBtns = ret1.data.AssignBtns;
          that.assignBtnIds = that.assignBtns.map(t => {
            return t.Id;
          })
        }

        let ret2 = res[1].data;
        if (ret2.success) {
          that.permissionList = ret2.data;

          if (that.permissionList.length == 0) {
            return;
          }

          //第一层菜单
          that.treeData = that.permissionList.filter((t) => {
            return t.ParentId == 0 || t.ParentId == null;
          }).map((t) => {
            return { id: t.Id, label: t.Name };
          });

          // 按钮
          that.treeData.forEach((item, index) => {
            item.btns = that.permissionList.filter((t) => {
              return t.IsButton && t.ParentId == item.id;
            }).map((t) => {
              return { value: t.Id, label: t.Name };
            });

            that.groupPermission(item);
          })
        } else {
          that.$message({ message: '加载菜单数据失败', type: 'error' });
        }
      }).catch(err => {
        that.$message({ message: '加载菜单数据失败', type: 'error' });
      })
    },
    //递归
    groupPermission(parent) {
      let temp = this.permissionList.filter((t) => {
        return t.ParentId == parent.id && !t.IsButton;
      }).map((t) => {
        return { id: t.Id, label: t.Name };
      });

      if (temp.length == 0) return null;

      temp.forEach((item, index) => {
        item.btns = this.permissionList.filter((t) => {
          return t.IsButton && t.ParentId == item.id;
        }).map((t) => {
          return { value: t.Id, label: t.Name };
        });

        parent.children = temp;

        this.groupPermission(item);
      })
    },
    //获取菜单Id，通过角色id
    getPermissionIds(rid) {
      let that = this;
      getPermissionIdsByRoleId(rid).then((res) => {
        let ret = res.data;
        if (ret.success) {
          that.$refs.tree.setCheckedKeys(ret.data.PermissionIds);
          if (ret.data.AssignBtns) {
            that.assignBtns = ret.data.AssignBtns;
            that.assignBtnIds = that.assignBtns.map(t => {
              return t.Id;
            })
          }
        }
      });
    },
    //保存授权
    saveAssign() {
      let that = this;
      let pids = that.$refs.tree.getCheckedKeys();
      if (that.assignBtnIds.length > 0) {
        pids = pids.concat(that.assignBtnIds);
      }

      if (that.roleId > 0 && pids.length > 0) {
        assignPermission({ roleId: that.roleId, permissionIds: pids }).then((res) => {
          let ret = res.data;
          if (ret.success) {

            that.$message({
              message: ret.msg,
              type: 'success'
            });

            that.getPermissionIds(that.roleId).then((res) => {
              that.$refs.tree.setCheckedKeys(res.data.data.PermissionIds);
              that.assignBtns = res.data.data.AssignBtns;
              that.$message({
                message: "数据更新成功",
                type: 'success'
              });
            });
          } else {
            that.$message({
              message: ret.msg,
              type: 'error'
            });
          }
        });
      } else {
        that.$message({
          message: "参数错误",
          type: 'error'
        });
      }
    },
    // 树节点选择监听
    handleMenuCheckChange(data, check, subCheck) {
      if (check) {
        // 节点选中时同步选中父节点
        let parentId = data.parentId
        this.$refs.tree.setChecked(parentId, true, false)
      } else {
        // 节点取消选中时同步取消选中子节点
        if (data.children != null) {
          data.children.forEach(element => {
            this.$refs.tree.setChecked(element.id, false, false)
          });
        }
      }
    },
    //全选
    checkAll() {
      let pids = this.permissionList.map(t => {
        return t.Id;
      });
      this.$refs.tree.setCheckedKeys(pids);
    },
    //清空
    resetChecked() {
      this.$refs.tree.setCheckedKeys([]);
    },
    // 递归全选
    checkAllMenu(menuData, allMenus) {
      menuData.forEach(menu => {
        allMenus.push(menu)
        if (menu.children) {
          this.checkAllMenu(menu.children, allMenus)
        }
      });
    },
  },
  created() {
    const id = this.$route.params && this.$route.params.id;
    if (id > 0) {
      this.roleId = id;
      this.getPermissionList(id);
    }
  }
}
</script>

<style>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.text {
  font-size: 14px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}

.clearfix:after {
  clear: both;
}

.box-card {
  width: 90%;
}

.el-checkbox + .el-checkbox {
  margin-left: 5px !important;
}

.el-checkbox {
  margin-right: 5px !important;
}
</style>
