import { defineStore } from "pinia"
import type { DatabaseTab } from "./types"

export const useTabsStore = defineStore('tabs', {
  state: () => ({
    tabs: [] as DatabaseTab[],
    activeTabUuid: '' as string,
  }),

  getters: {
  },

  actions: {
    addTab(tab: DatabaseTab) {
      const existing = this.tabs.find(t => t.uuid === tab.uuid)
      if (!existing) {
        this.tabs.push(tab)
      }
      this.activeTabUuid = tab.uuid
    },

    removeTab(uuid: string) {
      const index = this.tabs.findIndex(tab => tab.uuid === uuid)
      if (index !== -1) {
        this.tabs.splice(index, 1)

        // Set active tab to previous one or first available
        if (this.activeTabUuid === uuid) {
          const newTab = this.tabs[index - 1] || this.tabs[0]
          this.activeTabUuid = newTab?.uuid || ''
        }
      }
    },

    clearAllTabs() {
      this.tabs = []
      this.activeTabUuid = ''
    }
  }
})