<template>
    <!-- QUERY BLOCK - Only show when tabs exist -->
    <div v-if="tabs.length > 0" class="h-full flex flex-col select-none">

        <!-- Top: Query Area -->
        <div :style="{ height: topHeight + 'px' }" ref="topPane"
            class="bg-[linear-gradient(135deg,_#0a0a23,_#1a1a2e,_#16213e)] flex flex-col">
            <div class="bg-black flex items-center gap-2 justify-start">
                <el-button-group class="p-2 flex-shrink-0">
                    <el-tooltip placement="bottom" effect="customized">
                        <template #content>
                            <div>
                                <div>Click to run query (Ctrl+Enter or F5)</div>
                                <!-- <div class="text-xs text-gray-300 mt-1">
                                    Runs selected text if any, otherwise runs full query
                                </div> -->
                            </div>
                        </template>
                        <el-button type="primary" color="#00d4ff" @click="executeQuery">
                            <Icon icon="mingcute:play-fill" width="18" height="18" />
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="Open file (Ctrl+O)" placement="bottom" effect="customized">
                        <el-button type="primary" color="#00d4ff" @click="loadQuery">
                            <Icon icon="entypo:folder" width="18" height="18" />
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="Save query (Ctrl+S)" placement="bottom" effect="customized">
                        <el-button type="primary" color="#00d4ff" @click="saveQuery">
                            <Icon icon="lets-icons:save-fill" width="18" height="18" />
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="Format SQL" placement="bottom" effect="customized">
                        <el-button type="primary" color="#00d4ff" @click="formatQuery">
                            <Icon icon="material-symbols:code" width="18" height="18" />
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="Clear query" placement="bottom" effect="customized">
                        <el-button type="primary" color="#ff4757" @click="clearQuery">
                            <Icon icon="mdi:clear-outline" width="18" height="18" />
                        </el-button>
                    </el-tooltip>
                    <el-tooltip content="Export to CSV" placement="bottom" effect="customized">
                        <el-button type="primary" color="#2ed573" @click="exportToCSV" :disabled="!tableData.length">
                            <Icon icon="material-symbols:download" width="18" height="18" />
                        </el-button>
                    </el-tooltip>
                </el-button-group>
                <el-tabs v-model="activeTab" type="card" @tab-remove="removeTab" class="demo-tabs flex-1" editable
                    tab-position="top">
                    <el-tab-pane v-for="item in tabs" :key="item.uuid" :label="item.title" :name="item.uuid" lazy>
                    </el-tab-pane>
                </el-tabs>
            </div>

            <div class="flex-1 w-full overflow-hidden">
                <Monaco language="sql" v-model="sql" ref="monacoRef" @selection-change="onSelectionChange" />
            </div>
        </div>

        <!-- Drag Handle -->
        <div class="h-1 bg-[linear-gradient(45deg,_#006aff,_#00d4ff)] cursor-row-resize" @mousedown="startDragging">
        </div>

        <!-- Bottom: Table Area -->
        <div v-loading="queryLoading" element-loading-background="rgba(0, 0, 0, 0.6)"
            element-loading-text="wait a moment"
            class="bg-[linear-gradient(135deg,_#0a0a23,_#1a1a2e,_#16213e)] flex-1 flex flex-col overflow-hidden">
            <!-- Results Header -->
            <div class="bg-black px-4 py-2 flex items-center justify-between border-b border-gray-700">
                <div class="flex items-center gap-4">
                    <span class="text-white font-medium">Query Results</span>
                    <span class="text-gray-400 text-sm" v-if="tableData.length">
                        {{ tableData.length }} rows, {{ columns.length }} columns
                    </span>
                </div>
                <div class="flex items-center gap-2" v-if="tableData.length">
                    <el-button size="small" @click="exportToCSV">
                        <Icon icon="material-symbols:download" width="16" height="16" />
                        Export CSV
                    </el-button>
                </div>
            </div>

            <!-- Table or Empty State -->
            <div class="flex-1 overflow-y-auto overflow-x-auto" v-if="tableData.length">
                <el-table :data="tableData" border style="min-width: max-content" height="100%" show-overflow-tooltip>
                    <el-table-column type="selection" width="55" />
                    <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" :min-width="150" sortable
                        show-overflow-tooltip>
                        <template #header>
                            <div class="flex items-center gap-2 w-full justify-between">
                                <span class="font-semibold text-sm">{{ col.label }}</span>
                                <span class="text-xs border px-2 border-[#00d4ff] text-[#00d4ff] rounded-2xl">
                                    {{ col.type }}
                                </span>
                            </div>
                        </template>

                        <template #default="{ row, $index }">
                            <el-popover placement="bottom-start" :width="300" trigger="manual"
                                :visible="activePopover === `${$index}-${col.prop}`" @hide="onPopoverHide">
                                <template #reference>
                                    <div class="select-text cursor-pointer hover:bg-blue-50/5 active:bg-blue-50/20 p-1 rounded transition-colors truncate"
                                        @dblclick.prevent="showPopover($index, col.prop, row[col.prop])" @click.stop
                                        :title="'Double-click to edit: ' + row[col.prop]">
                                        {{ row[col.prop] }}
                                    </div>
                                </template>

                                <!-- Popover Content -->
                                <div class="cell-popover">
                                    <!-- Header -->
                                    <div
                                        class="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/30">
                                        <div class="text-sm font-medium text-gray-200">
                                            {{ col.label }} ({{ col.type }})
                                        </div>
                                        <el-button type="text" size="small" @click="closePopover"
                                            class="text-gray-400 hover:text-gray-600">
                                            ✕
                                        </el-button>
                                    </div>

                                    <!-- Value Display/Edit -->
                                    <div class="mb-3">
                                        <div class="text-xs text-gray-200 mb-1">Value:</div>
                                        <el-input ref="editInputRef"
                                            style="--el-input-bg-color: rgba(0, 0, 0, 0.6); --el-input-border-color: rgba(255, 255, 255, 0.2);"
                                            size="large" v-model="editValue" autocomplete="off" class="capitalize"
                                            :readonly="!isEditing" @dblclick.stop="enableEditing" @input="onValueChange"
                                            @keyup.enter="saveValue" @keyup.esc="toggleEdit" :class="{
                                                'opacity-75 cursor-pointer': !isEditing,
                                                'opacity-100': isEditing
                                            }"
                                            :placeholder="isEditing ? 'Enter new value...' : 'Double-click to edit'" />
                                    </div>

                                    <!-- Actions -->
                                    <div class="flex flex-wrap gap-2">
                                        <el-button size="small" type="primary" @click="copyValue(selectedCellValue)"
                                            class="flex-1">
                                            <Icon icon="material-symbols:content-copy" width="14" height="14"
                                                class="mr-1" />
                                            Copy
                                        </el-button>

                                        <el-button size="small" @click="saveValue" class="flex-1" type="success"
                                            :disabled="!hasUnsavedChanges">
                                            <Icon icon="material-symbols:save" width="14" height="14" class="mr-1" />
                                            Save
                                        </el-button>
                                    </div>

                                    <div class="flex flex-wrap gap-2 mt-2">
                                        <el-button size="small" @click="copyColumnName(col.label)" class="flex-1" plain>
                                            <Icon icon="material-symbols:table-rows" width="14" height="14"
                                                class="mr-1" />
                                            Copy Column
                                        </el-button>

                                        <el-button size="small" @click="toggleEdit"
                                            :type="isEditing ? 'info' : 'warning'" class="flex-1"
                                            :disabled="!props.canEdit">
                                            <Icon
                                                :icon="isEditing ? 'material-symbols:cancel' : 'material-symbols:edit'"
                                                width="14" height="14" class="mr-1" />
                                            {{ isEditing ? 'Cancel' : 'Edit' }}
                                        </el-button>
                                    </div>

                                    <!-- Info -->
                                    <div class="mt-3 pt-2 border-t border-gray-200/30 text-xs text-gray-200">
                                        Row: {{ $index + 1 }} | Length: {{ String(editValue || '').length }}
                                        <div v-if="editValue === null || editValue === ''" class="text-orange-600 mt-1">
                                            ⚠ {{ editValue === null ? 'NULL value' : 'Empty value' }}
                                        </div>
                                        <div v-if="hasUnsavedChanges" class="text-yellow-600 mt-1">
                                            ⚠ Unsaved changes
                                        </div>
                                    </div>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <!-- Empty State -->
            <div v-else class="flex-1 flex items-center justify-center">
                <div class="text-center text-gray-400">
                    <Icon icon="material-symbols:database" width="64" height="64" class="mx-auto mb-4 opacity-50" />
                    <h3 class="text-lg font-medium mb-2">No Results</h3>
                    <p class="text-sm">
                        {{ queryLoading ? 'Executing query...' : 'Write a SQL query and click Run to see results' }}
                    </p>
                </div>
            </div>
        </div>
    </div>

    <!-- WELCOME BLOCK - Show when no tabs exist -->
    <div v-else class="h-full flex flex-col">

        <!-- Welcome Content -->
        <div class="flex-1 overflow-y-auto">
            <div class="min-h-full flex items-center justify-center p-4">
                <div class="max-w-2xl text-center w-full">
                    <!-- Main Icon -->
                    <div class="mb-6">
                        <!-- <Icon icon="material-symbols:database" width="80" height="80"
                            class="mx-auto text-[#00d4ff] opacity-60" /> -->
                        <img src="/public/images/feature-tarantool.png" alt="tarantool-feature"
                            class="h-56 w-full object-contain">
                    </div>

                    <!-- Welcome Text -->
                    <h2 class="text-2xl font-bold text-white mb-3">
                        Ready to Query Your Database
                    </h2>
                    <p class="text-gray-300 mb-6 leading-relaxed">
                        Create a new query tab to start writing SQL queries and exploring your data.
                    </p>

                    <!-- Action Buttons -->
                    <div class="flex flex-col sm:flex-row gap-3 justify-center mb-8">
                        <el-button type="primary" size="large" color="#00d4ff" class="px-6 py-2"
                            @click="showCreateDBDialog = true">
                            <Icon icon="material-symbols:add" width="18" height="18" class="mr-2" />
                            Create New Database Connection
                        </el-button>
                        <el-button size="large" @click="showSelectDBDialog = true" class="px-6 py-2" plain>
                            <Icon icon="carbon:query" width="18" height="18" class="mr-2" />
                            Start Query
                        </el-button>
                    </div>

                    <!-- Quick Tips -->
                    <div class="grid md:grid-cols-3 gap-4 text-left mb-6">
                        <div class="bg-black/30 rounded-lg p-4 border border-gray-700/50">
                            <div class="flex items-center gap-2 mb-2">
                                <Icon icon="mingcute:play-fill" width="20" height="20" class="text-[#00d4ff]" />
                                <h3 class="font-semibold text-white text-sm">Quick Execute</h3>
                            </div>
                            <p class="text-gray-400 text-xs">
                                Press <kbd class="px-1 py-0.5 bg-gray-800 rounded text-xs">Ctrl+Enter</kbd>
                                or <kbd class="px-1 py-0.5 bg-gray-800 rounded text-xs">F5</kbd> to run queries
                            </p>
                        </div>

                        <div class="bg-black/30 rounded-lg p-4 border border-gray-700/50">
                            <div class="flex items-center gap-2 mb-2">
                                <Icon icon="material-symbols:code" width="20" height="20" class="text-[#00d4ff]" />
                                <h3 class="font-semibold text-white text-sm">SQL Formatting</h3>
                            </div>
                            <p class="text-gray-400 text-xs">
                                Auto-format your SQL queries for better readability
                            </p>
                        </div>

                        <div class="bg-black/30 rounded-lg p-4 border border-gray-700/50">
                            <div class="flex items-center gap-2 mb-2">
                                <Icon icon="material-symbols:download" width="20" height="20" class="text-[#00d4ff]" />
                                <h3 class="font-semibold text-white text-sm">Export Results</h3>
                            </div>
                            <p class="text-gray-400 text-xs">
                                Export query results to CSV format
                            </p>
                        </div>
                    </div>

                    <!-- Footer Note -->
                    <div class="pt-4 border-t border-gray-700/50">
                        <p class="text-gray-500 text-xs">
                            💡 Tip: You can have multiple query tabs open and switch between them easily
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Create DB Connection Dialog -->
    <el-dialog v-model="showCreateDBDialog" :show-close="false" title="Create DB Connection" width="450px" align-center
        class="custom-dialog !bg-[#0A0A12] border !border-[var(--el-border-color)] !rounded-2xl">

        <el-form :model="dbForm" label-width="100px" class="space-y-4 my-4">
            <el-form-item label="DB Name" class="!mb-4">
                <el-input v-model="dbForm.db_name" placeholder="Enter database name"
                    class="!bg-[#1a1a2e] !border-[var(--el-border-color)]" />
            </el-form-item>

            <el-form-item label="Host" class="!mb-4">
                <el-input v-model="dbForm.host" placeholder="Enter host address"
                    class="!bg-[#1a1a2e] !border-[var(--el-border-color)]" />
            </el-form-item>

            <el-form-item label="Port" class="!mb-4">
                <el-input-number v-model="dbForm.port" :min="1" :max="65535" placeholder="Enter port number"
                    class="!bg-[#1a1a2e] !border-[var(--el-border-color)] w-full" />
            </el-form-item>

            <el-form-item label="Username" class="!mb-4">
                <el-input v-model="dbForm.username" placeholder="Enter username"
                    class="!bg-[#1a1a2e] !border-[var(--el-border-color)]" />
            </el-form-item>

            <el-form-item label="Password" class="!mb-4">
                <el-input v-model="dbForm.password" type="password" placeholder="Enter password" show-password
                    class="!bg-[#1a1a2e] !border-[var(--el-border-color)]" />
            </el-form-item>
        </el-form>

        <template #header="{ close, titleId, titleClass }">
            <div class="custom-dialog-header flex justify-between border-b pb-3 !border-[var(--el-border-color)]">
                <h3 :id="titleId" :class="titleClass"
                    class="custom-dialog-title flex font-semibold !text-[#06b6d4] items-center gap-2">
                    <Icon icon="proicons:database-add" width="24" height="24" />
                    Create DB Connection
                </h3>
                <el-button :icon="Close" circle @click="close" plain />
            </div>
        </template>

        <template #footer>
            <span class="dialog-footer flex justify-end gap-2">
                <el-button size="large" @click="showCreateDBDialog = false" plain>
                    Cancel
                </el-button>
                <el-button size="large" @click="createDBConnection" color="#06b6d4" :disabled="!isFormValid"
                    :loading="createDBLoading">
                    Create Connection
                </el-button>
            </span>
        </template>
    </el-dialog>

    <!-- Select Database Dialog -->
    <el-dialog v-model="showSelectDBDialog" :show-close="false" title="Select Database" width="500px" align-center
        class="custom-dialog !bg-[#0A0A12] border !border-[var(--el-border-color)] !rounded-2xl">

        <!-- Search Input -->
        <div class="mb-4">
            <el-input v-model="dbSearchQuery" placeholder="Search databases..." clearable
                class="!bg-[#1a1a2e] !border-[var(--el-border-color)]">
                <template #prefix>
                    <Icon icon="material-symbols:search" width="18" height="18" class="text-gray-400" />
                </template>
            </el-input>
        </div>

        <!-- Database List -->
        <div class="max-h-80 overflow-y-auto">
            <div v-if="loadingDatabases" class="flex justify-center items-center py-8">
                <el-icon class="is-loading text-[#00d4ff] mr-2">
                    <Loading />
                </el-icon>
                <span class="text-gray-300">Loading databases...</span>
            </div>

            <div v-else-if="databases.length === 0" class="text-center py-8">
                <Icon icon="material-symbols:database-off" width="48" height="48" class="mx-auto text-gray-500 mb-2" />
                <p class="text-gray-400">No databases found</p>
                <p class="text-gray-500 text-sm mt-1">Create a new database connection to get started</p>
            </div>

            <div v-else class="space-y-2">
                <div v-for="(database, index) in databases" :key="index" @click="selectDatabase(database)"
                    class="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-gray-700/50 hover:border-[#00d4ff]/50 hover:bg-black/50 cursor-pointer transition-all duration-200 group">

                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-[#00d4ff]/10 rounded-lg flex items-center justify-center">
                            <Icon icon="material-symbols:database" width="20" height="20" class="text-[#00d4ff]" />
                        </div>
                        <div>
                            <h4 class="text-white font-medium group-hover:text-[#00d4ff] transition-colors">
                                {{ database.db_name }}
                            </h4>
                            <!-- <p class="text-gray-400 text-sm">
                                {{ database.host }}:{{ database.port }}
                            </p> -->
                        </div>
                    </div>

                    <div class="flex items-center gap-2">
                        <!-- Connection Status -->
                        <div class="flex items-center gap-1">
                            <!-- <div :class="[
                                'w-2 h-2 rounded-full',
                                database.connected ? 'bg-green-500' : 'bg-gray-500'
                            ]"></div>
                            <span class="text-xs text-gray-400">
                                {{ database.connected ? 'Connected' : 'Disconnected' }}
                            </span> -->
                        </div>

                        <Icon icon="material-symbols:arrow-forward-ios" width="16" height="16"
                            class="text-gray-400 group-hover:text-[#00d4ff] transition-colors" />
                    </div>
                </div>
            </div>
        </div>

        <template #header="{ close, titleId, titleClass }">
            <div class="custom-dialog-header flex justify-between border-b pb-3 !border-[var(--el-border-color)]">
                <h3 :id="titleId" :class="titleClass"
                    class="custom-dialog-title flex font-semibold !text-[#06b6d4] items-center gap-2">
                    <Icon icon="material-symbols:database" width="24" height="24" />
                    Select Database to Query
                </h3>
                <el-button :icon="Close" circle @click="close" plain />
            </div>
        </template>

        <template #footer>
            <span class="dialog-footer flex justify-between">
                <!-- <el-button size="large" @click="handleCreateNewConnection" plain>
                    <Icon icon="material-symbols:add" width="16" height="16" class="mr-1" />
                    New Connection
                </el-button> -->
                <el-button size="large" @click="showSelectDBDialog = false" plain>
                    Cancel
                </el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, onUnmounted, onMounted, computed, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import Monaco from '@/components/monaco-editor/Monaco.vue'
import axiosInstance from '@/common/axios'
import type { ApiResponse } from '@/types/axios-response'
import { showToast } from '@/utils/toast'
import { useTabsStore } from '@/stores/tabs'
import type { DBForm, UserDatabase } from '@/types/tree-node'
import {
    Close
} from '@element-plus/icons-vue'
import type { Database, DatabaseRequest } from '@/types/database'
import { useUserStore } from '@/stores/user'

// Interfaces
interface Column {
    prop: string
    label: string
    type: string
}

const dbForm = ref<DBForm>({
    db_name: '',
    host: '',
    port: 3306,
    username: '',
    password: ''
})

const tabsStore = useTabsStore()
const userStore = useUserStore()
const showCreateDBDialog = ref<boolean>(false)
const createDBLoading = ref<boolean>(false)
const showSelectDBDialog = ref<boolean>(false)
const loadingDatabases = ref<boolean>(false)
const dbSearchQuery = ref<string>('')

const selectDatabase = (database: UserDatabase): void => {
    showSelectDBDialog.value = false
    startQueryWithDatabase(database)
}

const startQueryWithDatabase = (database: UserDatabase): void => {
    console.log('Starting query with database:', database)
    // emit('start-query', database)
}

const databases = computed(() => {
    return userStore.userInfo?.user_databases.length ? userStore.userInfo.user_databases : []
})

const activeTab = computed(() => {
    if (tabsStore.activeTabUuid) {
        return tabsStore.activeTabUuid
    } else {
        return ''
    }
})

const tabs = computed(() => {
    if (tabsStore.tabs) {
        return tabsStore.tabs
    } else {
        return []
    }
})

const removeTab = (uuid: string) => {
    tabsStore.removeTab(uuid)
}

// Props - removed duplicate interface and simplified
const props = withDefaults(defineProps<{
    canEdit?: boolean
}>(), {
    canEdit: true
})

// Emits
const emit = defineEmits<{
    cellUpdated: [payload: {
        row: number
        column: string
        oldValue: any
        newValue: any
    }]
}>()

const isFormValid = computed(() => {
    return dbForm.value.db_name &&
        dbForm.value.host &&
        dbForm.value.port &&
        dbForm.value.username &&
        dbForm.value.password
})

const createDBConnection = async () => {
    if (!isFormValid.value) return

    createDBLoading.value = true

    try {
        const dbRequest: DatabaseRequest = {
            db_name: dbForm.value.db_name,
            host: dbForm.value.host,
            port: dbForm.value.port,
            username: dbForm.value.username,
            password: dbForm.value.password,
        }

        const response = await axiosInstance.post("/front/database", dbRequest) as ApiResponse<{ database: Database }>

        if (response.success) {
            showToast({
                message: response.message || 'Database connection created successfully',
                type: "success",
            })
            showCreateDBDialog.value = false
            resetForm()
            await userStore.fetchUserInfo()
            await nextTick()
        } else {
            showToast({
                message: response.message || 'Failed to create database connection',
                type: "error",
                desc: response.data.error,
            })
        }
    } catch (error: any) {
        console.error('Failed to create database connection:', error)
        showToast({
            message: error?.message || 'Failed to create database connection',
            type: "error",
            desc: error?.data?.error
        })
    } finally {
        createDBLoading.value = false
    }
}

const resetForm = () => {
    dbForm.value = {
        db_name: '',
        host: '',
        port: 3306,
        username: '',
        password: ''
    }
}

// SQL Editor and Query
const sql = ref<string>("SELECT * FROM users_space")
const monacoRef = ref<any>(null)
const selectedText = ref<string>('')
const hasTextSelection = ref<boolean>(false)
const databaseUUID = ref<string>('019777fb-b27b-77d9-9387-721511fd0efc')

// Table Data
const columns = ref<Column[]>([])
const tableData = ref<any[]>([])
const queryLoading = ref<boolean>(false)

// Layout Management
const topPane = ref<HTMLElement | null>(null)
const topHeight = ref<number>(window.innerHeight * 0.4)
let isDragging = false
const minTopHeight = 100
const minBottomHeight = 150

// Popover and Edit States
const activePopover = ref<string | null>(null)
const selectedCellValue = ref<any>('')
const isEditing = ref(false)
const editValue = ref<string>('')
const originalValue = ref<any>('')
const currentEditRow = ref<number | null>(null)
const currentEditColumn = ref<string | null>(null)
const editInputRef = ref()

// Computed
const hasUnsavedChanges = computed(() => {
    return editValue.value !== originalValue.value
})

// Removed duplicate canEdit ref - use props.canEdit instead

// Methods
const showPopover = (rowIndex: number, columnProp: string, cellValue: any) => {
    // Close any existing popover first
    if (activePopover.value) {
        closePopover()
    }

    // Small delay to ensure previous popover is closed
    setTimeout(() => {
        activePopover.value = `${rowIndex}-${columnProp}`
        selectedCellValue.value = cellValue
        editValue.value = cellValue !== null && cellValue !== undefined ? String(cellValue) : ''
        originalValue.value = cellValue
        currentEditRow.value = rowIndex
        currentEditColumn.value = columnProp
        isEditing.value = false
    }, 100)
}

const closePopover = () => {
    activePopover.value = null
    resetEditState()
}
const onPopoverHide = () => {
    activePopover.value = null
    resetEditState()
}

const resetEditState = () => {
    isEditing.value = false
    if (originalValue.value !== null && originalValue.value !== undefined) {
        editValue.value = String(originalValue.value)
    } else {
        editValue.value = ''
    }
    currentEditRow.value = null
    currentEditColumn.value = null
}


const enableEditing = async () => {
    if (props.canEdit) {
        isEditing.value = true
        // Focus the input after Vue updates the DOM
        await nextTick()
        if (editInputRef.value) {
            editInputRef.value.focus()
            editInputRef.value.select() // This will select all text
        }
        showToast({
            type: 'success',
            message: 'Edit mode enabled - Press Enter to save, Esc to cancel',
        })
    } else {
        showToast({
            type: 'warning',
            message: 'Editing is not allowed'
        })
    }
}

const toggleEdit = async () => {
    if (isEditing.value) {
        // Cancel editing - restore original value
        editValue.value = originalValue.value !== null && originalValue.value !== undefined ? String(originalValue.value) : ''
        isEditing.value = false
        showToast({
            type: 'info',
            message: 'Edit cancelled',
        })
    } else {
        // Enable editing
        await enableEditing()
    }
}

const onValueChange = () => {
    // This will trigger the computed property automatically
}

const saveValue = () => {
    if (hasUnsavedChanges.value && currentEditRow.value !== null && currentEditColumn.value !== null) {
        // Update the actual table data
        const rowIndex = currentEditRow.value
        const columnProp = currentEditColumn.value
        const oldValue = originalValue.value
        const newValue = editValue.value

        // Update the data
        tableData.value[rowIndex][columnProp] = newValue

        // Update tracking variables
        originalValue.value = newValue
        selectedCellValue.value = newValue
        isEditing.value = false

        // Show success message
        showToast({
            type: 'success',
            message: 'Value saved successfully!',
        })

        // Emit event for parent component
        emit('cellUpdated', {
            row: rowIndex,
            column: columnProp,
            oldValue,
            newValue
        })
    } else if (!hasUnsavedChanges.value) {
        showToast({
            type: 'info',
            message: 'No changes to save',
        })
    }
}

const copyValue = async (value: any) => {
    try {
        await navigator.clipboard.writeText(String(value || ''))
        showToast({
            type: 'success',
            message: 'Value copied to clipboard!',
        })
    } catch {
        showToast({
            type: 'error',
            message: 'Failed to copy value',
        })
    }
}

const copyColumnName = async (columnName: string) => {
    try {
        await navigator.clipboard.writeText(columnName)
        showToast({
            type: 'success',
            message: 'Column name copied to clipboard!',
        })
    } catch {
        showToast({
            type: 'error',
            message: 'Failed to copy column name',
        })
    }
}

const handleGlobalClick = (event: Event) => {
    // Only close if clicking outside the popover and not on a cell
    const target = event.target as HTMLElement
    if (!target.closest('.el-popover') && !target.closest('.cell-popover') && activePopover.value) {
        // Don't close if clicking on a table cell (let the cell handle it)
        if (!target.closest('.el-table__body td')) {
            closePopover()
        }
    }
}

// Drag Handle Functions
const startDragging = (e: MouseEvent) => {
    isDragging = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopDragging)
}

const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newHeight = e.clientY
    const windowHeight = window.innerHeight
    const remainingHeight = windowHeight - newHeight

    if (newHeight >= minTopHeight && remainingHeight >= minBottomHeight) {
        topHeight.value = newHeight
    }
}

const stopDragging = () => {
    isDragging = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', stopDragging)
}

// Main query execution function
const executeQuery = async (): Promise<void> => {
    let queryToExecute = sql.value.trim()
    let isSelectionQuery = false

    // Check if there's selected text in Monaco editor
    if (monacoRef.value?.hasSelection?.()) {
        const selection = monacoRef.value.getSelectedText()
        if (selection && selection.trim()) {
            queryToExecute = selection.trim()
            isSelectionQuery = true
            selectedText.value = selection.trim()
        }
    }

    if (!queryToExecute) {
        showToast({
            type: 'warning',
            message: 'Please enter a SQL query or select text to execute'
        })
        return
    }

    queryLoading.value = true

    try {
        const response = await axiosInstance.post(`/front/database/${databaseUUID.value}/query`, {
            query: queryToExecute,
        }) as ApiResponse<{ query_result: any }>

        if (response.success) {
            const queryResult = response.data.query_result

            // Transform columns
            columns.value = queryResult.columns.map((col: any) => ({
                prop: col.name,
                label: col.name,
                type: col.type
            }))

            tableData.value = queryResult.data || []

            const executionType = isSelectionQuery ? 'Selected query' : 'Full query'
            showToast({
                type: 'success',
                message: `${executionType} executed successfully! Found ${queryResult.data.length} rows`
            })

        } else {
            showToast({
                type: 'error',
                message: response.message || 'Query execution failed'
            })
        }

    } catch (error: any) {
        let errorMessage = 'An error occurred while executing the query'

        if (error.success === false) {
            errorMessage = error.message || errorMessage
            if (error.status_code === 400) {
                errorMessage = 'Invalid SQL syntax: ' + error.message
            }
        }

        showToast({
            type: 'error',
            message: errorMessage
        })
        tableData.value = []
        columns.value = []

    } finally {
        queryLoading.value = false
        selectedText.value = ''
    }
}

// selection change handler
const onSelectionChange = (selection: string) => {
    selectedText.value = selection
    hasTextSelection.value = selection.trim().length > 0
}

// Utility functions
const formatQuery = (): void => {
    if (monacoRef.value?.formatCode) {
        monacoRef.value.formatCode()
        showToast({
            type: 'success',
            message: 'Query formatted'
        })
    } else {
        // Fallback to your existing format logic
        const formatted = sql.value
            .replace(/\s+/g, ' ')
            .replace(/\b(SELECT|FROM|WHERE|JOIN|LEFT JOIN|RIGHT JOIN|INNER JOIN|ORDER BY|GROUP BY|HAVING|UNION|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/gi, '\n$1')
            .replace(/,/g, ',\n  ')
            .trim()

        sql.value = formatted
        showToast({
            type: 'success',
            message: 'Query formatted'
        })
    }
}
const clearQuery = (): void => {
    sql.value = ''
    tableData.value = []
    columns.value = []
    showToast({
        type: 'info',
        message: 'Query cleared'
    })
}

const exportToCSV = (): void => {
    if (!tableData.value.length) {
        showToast({
            type: 'warning',
            message: 'No data to export'
        })
        return
    }

    const csvHeaders = columns.value.map(col => col.label).join(',')
    const csvRows = tableData.value.map(row =>
        columns.value.map(col => {
            const value = row[col.prop]
            return typeof value === 'string' && value.includes(',')
                ? `"${value.replace(/"/g, '""')}"`
                : value
        }).join(',')
    )

    const csvContent = [csvHeaders, ...csvRows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `query_results_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    showToast({
        type: 'success',
        message: 'Data exported to CSV'
    })
}

const saveQuery = (): void => {
    if (!sql.value.trim()) {
        showToast({
            type: 'warning',
            message: 'No query to save'
        })
        return
    }

    const savedQueries = JSON.parse(localStorage.getItem('savedQueries') || '[]')
    const queryName = `Query_${new Date().toISOString().split('T')[0]}_${Date.now()}`

    savedQueries.push({
        name: queryName,
        sql: sql.value,
        timestamp: new Date().toISOString()
    })

    localStorage.setItem('savedQueries', JSON.stringify(savedQueries))
    showToast({
        type: 'success',
        message: `Query saved as "${queryName}"`
    })
}

const loadQuery = (): void => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.sql,.txt'

    input.onchange = (event: Event) => {
        const file = (event.target as HTMLInputElement).files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e: ProgressEvent<FileReader>) => {
                sql.value = e.target?.result as string
                showToast({
                    type: 'success',
                    message: 'Query loaded from file'
                })
            }
            reader.readAsText(file)
        }
    }

    input.click()
}

// Enhanced keyboard shortcuts function (updated)
const handleKeydown = (event: KeyboardEvent): void => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        executeQuery()
    }

    // Add F5 as alternative execute shortcut
    if (event.key === 'F5') {
        event.preventDefault()
        executeQuery()
    }

    // Add Ctrl+A to select all in Monaco (if focused)
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        // Let Monaco handle this naturally
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault()
        saveQuery()
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault()
        loadQuery()
    }

    // Add Escape to clear selection
    if (event.key === 'Escape') {
        if (monacoRef.value?.clearSelection) {
            monacoRef.value.clearSelection()
        }
    }
}

// Lifecycle hooks
onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('click', handleGlobalClick)
    stopDragging()
})
</script>

<style scoped>
::v-deep(.el-table-column--selection .cell) {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}

::v-deep(.el-tooltip__popper) {
    background-color: #303133 !important;
    color: white !important;
    border-radius: 4px;
    padding: 8px;
    font-size: 14px;
}

:deep(.el-table th .cell) {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
}

:deep(.el-table th .cell > div) {
    flex: 1;
}

:deep(.el-table .el-table__header-wrapper .el-table__header thead th) {
    background-color: black !important;
}

:deep(.el-table th .cell) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
}

:deep(.el-table th .cell:has(div.flex)) {
    justify-content: space-between !important;
}

:deep(.el-table-column--selection .cell) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100%;
}

:deep(.el-tabs__header) {
    margin: 0 !important;
    padding: 8px 0 !important;
}

:deep(.el-tabs__nav-wrap) {
    padding: 0 !important;
}

:deep(.el-tabs__item) {
    height: 36px !important;
    line-height: 36px !important;
    padding: 0 16px !important;
}

:deep(.el-tabs__content) {
    display: none !important;
}

.cell-popover {
    max-width: 300px;
}

.cell-popover .el-button {
    font-size: 12px;
}

:deep(.el-popover) {
    padding: 12px !important;
}

:deep(.el-dialog__body) {
    padding: 20px !important;
}
</style>