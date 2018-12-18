<template>
  <div>
    <el-tree
      :data="treeData"
      node-key="id"
      :expand-on-click-node="false"
      :render-content="renderContent"
      accordion
    ></el-tree>
    <el-dialog title="Edit item and price" :visible.sync="updateNamePriceModalVisible">
      <el-form>
        <el-form-item label="Name of priced Item (Input number only if it is for sessions)">
          <el-input v-model="name"></el-input>
        </el-form-item>
        <el-form-item label="Price of Item">
          <el-input type="number" v-model="price">
            <template slot="prepend">$</template>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="confirmEdit">Edit</el-button>
        <el-button @click="updateNamePriceModalVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
    <el-dialog title="Add Item/Category and/or Price" :visible.sync="addNamePriceModalVisible">
      <el-form>
        <el-form-item label="Name of priced Item (Input number only if it is for sessions)">
          <el-input v-model="name"></el-input>
        </el-form-item>
        <el-form-item label="Price of Item (Leave it empty if only adding new category)">
          <el-input type="number" v-model="price">
            <template slot="prepend">$</template>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="confirmAdd">Add</el-button>
        <el-button @click="addNamePriceModalVisible = false">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import _ from "lodash"
import { MISCELLEANEOUS, LESSONS } from "@/common/data"
export default {
  computed: {
    treeData() {
      const miscPriceList = this.$store.getters.getPriceList[MISCELLEANEOUS]
      const lessonsPriceList = this.$store.getters.getPriceList[LESSONS]
      const parsedMiscPriceList = _.map(miscPriceList, (value, category) => {
        const subCategory = _.map(value, (price, subcategory) => {
          const label = `${subcategory}, $${price}`
          const subCategoryOptions = {
            label,
            value: subcategory,
            price,
          }
          return subCategoryOptions
        })
        return {
          label: category,
          value: category,
          children: subCategory,
        }
      })
      const parsedLessonsPriceList = _.map(
        lessonsPriceList,
        (value, category) => {
          const subCategory = _.map(value, (value, subcategory) => {
            if (typeof value !== "object") {
              const label = `${subcategory} lessons, $${value}`
              const subCategoryOptions = {
                label,
                value: subcategory,
                price: value,
              }
              return subCategoryOptions
            } else {
              const children = _.map(value, (price, session) => {
                const label = `${session} lessons, $${price}`
                const options = {
                  label,
                  value: session,
                  price,
                }
                return options
              })
              const subCategoryOptions = {
                label: subcategory,
                value: subcategory,
                children,
              }
              return subCategoryOptions
            }
          })
          return {
            label: category,
            value: category,
            children: subCategory,
          }
        }
      )
      return [
        { label: LESSONS, value: LESSONS, children: parsedLessonsPriceList },
        {
          label: MISCELLEANEOUS,
          value: MISCELLEANEOUS,
          children: parsedMiscPriceList,
        },
      ]
    },
  },
  data() {
    return {
      currentSelection: [],
      price: "",
      name: "",
      updateNamePriceModalVisible: false,
      updating: false,
      addNamePriceModalVisible: false,
    }
  },
  methods: {
    confirmEdit() {
      this.updating = true
      this.$store.dispatch("updatePriceList", {
        current: this.currentSelection,
        newName: this.name,
        newPrice: this.price,
      })
      this.updateNamePriceModalVisible = false
      this.updating = false
    },
    confirmAdd() {
      this.updating = true
      this.$store.dispatch("addPriceList", {
        current: this.currentSelection,
        newName: this.name,
        newPrice: this.price,
      })
      this.addNamePriceModalVisible = false
      this.updating = false
    },
    remove(node, data) {
      const parent = node.parent
      const children = parent.data.children || parent.data
      const index = children.findIndex((d) => d.id === data.id)
      children.splice(index, 1)
    },
    startEdit(node) {
      const reversedPriceListKeys = []
      let currentNode = node
      let price
      while (true) {
        if (currentNode.parent === null) {
          break
        }
        reversedPriceListKeys.push(currentNode.data.value)
        if (currentNode.data.price) {
          price = currentNode.data.price
        }
        currentNode = currentNode.parent
      }
      const priceListKeys = reversedPriceListKeys.reverse()
      this.currentSelection = priceListKeys
      this.name = _.last(priceListKeys)
      this.price = price
      this.updateNamePriceModalVisible = true
    },
    startAdd(node) {
      const reversedPriceListKeys = []
      let currentNode = node
      while (true) {
        if (currentNode.parent === null) {
          break
        }
        reversedPriceListKeys.push(currentNode.data.value)
        currentNode = currentNode.parent
      }
      const priceListKeys = reversedPriceListKeys.reverse()
      this.currentSelection = priceListKeys
      this.addNamePriceModalVisible = true
    },

    renderContent(h, { node, data, store }) {
      if (data.price) {
        return (
          <span id="custom-tree-node">
            <span>{node.label}</span>
            <span>
              <el-button
                size="mini"
                type="text"
                on-click={() => this.startEdit(node, store)}
              >
                Edit
              </el-button>
              <el-button
                size="mini"
                type="text"
                on-click={() => this.remove(node, data)}
              >
                Delete
              </el-button>
            </span>
          </span>
        )
      }
      return (
        <span id="custom-tree-node">
          <span>{node.label}</span>
          <span>
            <el-button
              size="mini"
              type="text"
              on-click={() => this.startAdd(node)}
            >
              Add Item/Category
            </el-button>
            <el-button
              size="mini"
              type="text"
              on-click={() => this.remove(node, data)}
            >
              Delete
            </el-button>
          </span>
        </span>
      )
    },
  },
}
</script>

<style>
#custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
