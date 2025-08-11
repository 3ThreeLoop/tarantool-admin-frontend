<template>
    <div class="w-[300px] h-[calc(100vh-65px)] relative overflow-hidden">
        <div class="absolute inset-0 overflow-y-auto overflow-x-hidden">
            <!-- Background layer -->
            <div class="absolute inset-0"></div>

            <!-- Pattern overlay with proper mask -->
            <div class="absolute inset-0 bg-[#16213e3a]" :style="{
                WebkitMask: 'url(/images/pattern.svg) no-repeat center/cover',
                mask: 'url(/images/pattern.svg) no-repeat center/cover'
            }"></div>

            <!-- Content layer -->
            <div class="relative z-10 p-4 text-white h-full">
                <h2 class="mb-4 text-3xl font-inter font-semibold">My Database</h2>

                <!-- Scrollable content container -->
                <div class="overflow-y-auto overflow-x-hidden" style="height: calc(100% - 60px);">
                    <!-- Loading state -->
                    <div v-if="loading || !userStore.userInfo" class="flex items-center justify-center py-8">
                        <el-icon class="is-loading mr-2">
                            <Loading />
                        </el-icon>
                        <span>Loading databases...</span>
                    </div>

                    <!-- Tree component - only show when user info is loaded -->
                    <el-tree v-else-if="userStore.userInfo && treeData.length > 0" :renderContent="renderContent"
                        class="custom-tree" :data="treeData" :props="defaultProps" :load="loadNode" lazy
                        @node-click="handleNodeClick" />

                    <!-- No databases message -->
                    <div v-else-if="userStore.userInfo && treeData.length === 0" class="text-gray-400 text-center py-8">
                        No databases found. Create your first database connection.
                    </div>

                    <el-divider />

                </div>

                <!-- Enhanced Add Database Button - Fixed at bottom -->
                <div class="absolute bottom-4 left-4 right-4">
                    <el-button class="add-database-btn w-full" size="large" color="#00d4ff"
                        @click="showCreateDBDialog = true">
                        <div class="flex items-center justify-center gap-2 py-1">
                            <el-icon class="add-icon">
                                <Plus />
                            </el-icon>
                            <span class="btn-text">Add Database</span>
                        </div>
                    </el-button>
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
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, h, ref, watch, nextTick, onMounted } from 'vue'
import {
    Close,
    Plus,
    Loading
} from '@element-plus/icons-vue'
import type { Database, DatabaseRequest } from '@/types/database'
import axiosInstance from '@/common/axios'
import { showToast } from '@/utils/toast'
import type { ApiResponse } from '@/types/axios-response'
import { useUserStore } from '@/stores/user'
import type { DatabaseDetail, DBForm, TreeNode } from '@/types/tree-node'
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu } from 'element-plus'
import { useTabsStore } from '@/stores/tabs'

// Reactive data
const userStore = useUserStore()
const tabsStore = useTabsStore()
const loading = ref<boolean>(false)
const showCreateDBDialog = ref<boolean>(false)
const createDBLoading = ref<boolean>(false)
const treeData = ref<TreeNode[]>([])

// Cache for database details to avoid refetching
const databaseDetailsCache = ref<Map<string, DatabaseDetail>>(new Map())

const dbForm = ref<DBForm>({
    db_name: '',
    host: '',
    port: 3306,
    username: '',
    password: ''
})

const defaultProps = {
    children: 'children',
    label: 'label',
    isLeaf: 'isLeaf'
}

// Computed
const isFormValid = computed(() => {
    return dbForm.value.db_name &&
        dbForm.value.host &&
        dbForm.value.port &&
        dbForm.value.username &&
        dbForm.value.password
})

// Methods
const loadUserDatabases = () => {
    console.log('Loading user databases:', userStore.userInfo?.user_databases)

    if (userStore.userInfo?.user_databases && userStore.userInfo.user_databases.length > 0) {
        treeData.value = userStore.userInfo.user_databases.map(db => ({
            id: db.db_uuid,
            label: db.db_name,
            type: 'database',
            db_uuid: db.db_uuid,
            level: 1,
            isLeaf: false,
            expandFailed: false
        }))
    } else {
        treeData.value = []
    }
}

const fetchDatabaseDetail = async (dbUuid: string): Promise<DatabaseDetail | null> => {
    // Check cache first
    if (databaseDetailsCache.value.has(dbUuid)) {
        return databaseDetailsCache.value.get(dbUuid)!
    }

    try {
        const response = await axiosInstance.get(`/front/database/${dbUuid}/detail`) as ApiResponse<{ database_detail: DatabaseDetail }>

        if (response.success && response.data.database_detail) {
            // Cache the result
            databaseDetailsCache.value.set(dbUuid, response.data.database_detail)
            return response.data.database_detail
        }
        return null
    } catch (error: any) {
        console.error('Failed to fetch database detail:', error)
        showToast({
            message: error.message,
            type: 'error'
        })
        return null
    }
}

const buildSpacesWithColumns = (databaseDetail: DatabaseDetail, dbUuid: string): TreeNode[] => {
    if (!databaseDetail.spaces) return []

    return databaseDetail.spaces.map(space => ({
        id: `${dbUuid}-${space.name}`,
        label: space.name,
        type: 'space' as const,
        expandFailed: false,
        db_uuid: dbUuid,
        space_name: space.name,
        level: 2,
        isLeaf: false,
        children: space.format ? space.format.map(column => ({
            id: `${dbUuid}-${space.name}-${column.name}`,
            label: `${column.name} (${column.type}${column.is_nullable ? ', nullable' : ''})`,
            type: 'column' as const,
            expandFailed: false,
            db_uuid: dbUuid,
            space_name: space.name,
            column_info: column,
            level: 3,
            isLeaf: true
        })) : []
    }))
}

const loadNode = async (node: any, resolve: (data: TreeNode[]) => void) => {
    const nodeData = node.data as TreeNode

    if (node.level === 0) {
        resolve(treeData.value)
        return
    }

    if (nodeData.type === 'database') {
        try {
            const databaseDetail = await fetchDatabaseDetail(nodeData.db_uuid!)

            if (databaseDetail) {
                const children = buildSpacesWithColumns(databaseDetail, nodeData.db_uuid!)
                resolve(children)

                // Mark success
                nodeData.expandFailed = false
            } else {
                throw new Error('No data')
            }
        } catch (err) {
            console.error('Failed to load database:', err)

            // Mark failed
            nodeData.expandFailed = true

            node.loaded = false
            node.loading = false
            node.childNodes = []
            node.data.children = undefined

            setTimeout(() => {
                if (node.loading) node.loading = false
            }, 300)
        }
    } else if (nodeData.type === 'space') {
        resolve(nodeData.children || [])
    } else {
        resolve([])
    }
}

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
            // Clear cache when new database is added
            databaseDetailsCache.value.clear()
            await userStore.fetchUserInfo()
            await nextTick()
            loadUserDatabases()
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

const handleNodeClick = (data: TreeNode, e: MouseEvent) => {
    console.log('Node clicked:', data)
    if ((e.target as HTMLElement).closest('.el-dropdown')) {
        return; // Ignore dropdown clicks
    }
    // You can add additional logic here for when nodes are clicked
    // For example, select the node for some operation
}

const renderContent = (_: any, { data }: any) => {
    let iconName = ''
    let iconColor = ''

    switch (data.type) {
        case 'database':
            iconName = data.expandFailed ? 'mdi:database-off' : 'mdi:database'
            iconColor = data.expandFailed ? '#ef4444' : '#06b6d4'
            break
        case 'space':
            iconName = 'mdi:table'
            iconColor = '#10b981'
            break
        case 'column':
            if (data.column_info) {
                switch (data.column_info.type.toLowerCase()) {
                    case 'uuid':
                        iconName = 'mdi:key-variant'
                        iconColor = '#f59e0b'
                        break
                    case 'string':
                        iconName = 'mdi:format-text'
                        iconColor = '#06b6d4'
                        break
                    case 'number':
                    case 'unsigned':
                    case 'decimal':
                        iconName = 'mdi:numeric'
                        iconColor = '#10b981'
                        break
                    case 'boolean':
                        iconName = 'mdi:check-circle'
                        iconColor = '#8b5cf6'
                        break
                    case 'datetime':
                        iconName = 'mdi:calendar-clock'
                        iconColor = '#ef4444'
                        break
                    default:
                        iconName = 'mdi:table-column'
                        iconColor = '#6b7280'
                        break
                }
            } else {
                iconName = 'mdi:table-column'
                iconColor = '#6b7280'
            }
            break
        default:
            iconName = 'mdi:table-column'
            iconColor = '#6b7280'
            break
    }

    const iconProps = {
        icon: iconName,
        width: 18,
        height: 18,
        style: { color: iconColor }
    }

    // Fixed hover handlers with proper animation
    const handleMouseEnter = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement
        const labelEl = target.querySelector('.tree-label') as HTMLElement
        const containerEl = target.querySelector('.label-container') as HTMLElement

        if (labelEl && containerEl) {
            // Clear any existing animation and reset
            labelEl.style.animation = 'none'
            labelEl.style.transform = 'translateX(0)'

            // Force a reflow to ensure the animation reset takes effect
            labelEl.offsetHeight

            // Check if text overflows and animate
            setTimeout(() => {
                checkAndAnimateOverflow(labelEl, containerEl)
            }, 50) // Small delay to ensure proper calculation
        }
    }

    const handleMouseLeave = (e: MouseEvent) => {
        const target = e.currentTarget as HTMLElement
        const labelEl = target.querySelector('.tree-label') as HTMLElement

        if (labelEl) {
            // Stop animation and reset position
            labelEl.style.animation = 'none'
            labelEl.style.transform = 'translateX(0)'

            // Clean up dynamic keyframes
            const keyframeStyleId = labelEl.getAttribute('data-keyframe-style')
            if (keyframeStyleId) {
                const styleEl = document.getElementById(keyframeStyleId)
                if (styleEl) {
                    styleEl.remove()
                }
                labelEl.removeAttribute('data-keyframe-style')
            }
        }
    }

    const dropdownMenu = data.type === 'database'
        ? h(ElDropdown, {
            trigger: 'click',
            onCommand: (command: string) => handleDbCommand(command, data),
        }, {
            default: () =>
                h(ElButton, {
                    icon: h(Icon, { icon: 'mdi:dots-vertical' }),
                    size: 'small',
                    circle: true,
                    plain: true,
                    onClick: (e: MouseEvent) => e.stopPropagation()
                }),
            dropdown: () =>
                h(ElDropdownMenu, {}, [
                    h(ElDropdownItem, { command: 'query' }, {
                        default: () => [
                            h(Icon, { icon: 'mdi:database-search', class: 'mr-2' }),
                            'Query'
                        ]
                    }),
                    h(ElDropdownItem, { command: 'update' }, {
                        default: () => [
                            h(Icon, { icon: 'mdi:database-edit', class: 'mr-2' }),
                            'Update'
                        ]
                    }),
                    h(ElDropdownItem, { command: 'delete' }, {
                        default: () => [
                            h(Icon, { icon: 'mdi:database-remove', class: 'mr-2 text-red-500' }),
                            'Delete'
                        ]
                    }),
                ])
        })
        : null

    return h('div', {
        class: 'tree-node-content flex items-center gap-2 min-w-0 w-full',
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave
    }, [
        h(Icon, iconProps),
        h('div', {
            class: 'label-container flex-1 min-w-0 overflow-hidden relative',
        }, [
            h('span', {
                class: `tree-label whitespace-nowrap inline-block ${data.type === 'column' && data.column_info?.is_nullable ? 'opacity-75' : ''}`,
            }, data.label)
        ]),

        dropdownMenu
    ])
}

const handleDbCommand = (command: string, db: TreeNode) => {
    switch (command) {
        case 'query':
            tabsStore.addTab({
                uuid: `${db.db_uuid}`,
                title: `(${db.label}) ${db.db_uuid}`,
                name: `${db.label}`,
                sql_query: ''
            })
            // openQueryModal(node)
            break
        case 'update':
            console.log('Update DB:', db)
            // openUpdateForm(node)
            break
        case 'delete':
            console.log('Delete DB:', db)
            // confirmAndDelete(node)
            break
    }
}


// Fixed animation function using direct CSS animation with transform
const checkAndAnimateOverflow = (labelEl: HTMLElement, containerEl: HTMLElement) => {
    // Force layout recalculation to ensure accurate measurements
    labelEl.offsetHeight;
    containerEl.offsetHeight;

    const containerWidth = containerEl.clientWidth - 10;
    const textWidth = labelEl.scrollWidth;

    // Add a threshold - only animate if text exceeds container by at least 10px
    const threshold = 10;

    console.log('Container width:', containerWidth, 'Text width:', textWidth, 'Difference:', textWidth - containerWidth);

    if (textWidth > containerWidth + threshold) {
        const overflowAmount = textWidth - containerWidth
        const scrollDistance = overflowAmount + 180

        console.log('Overflow detected, scroll distance:', scrollDistance)

        // Calculate duration based on content length (2-5 seconds)
        const baseSpeed = 100 // pixels per second
        const animationDuration = Math.max(2, Math.min(5, scrollDistance / baseSpeed)) * 5

        // Create dynamic keyframes and apply animation directly
        const keyframeName = `scroll-${Math.random().toString(36).substr(2, 9)}`

        // Create keyframes dynamically
        const keyframes = `
            @keyframes ${keyframeName} {
                0%, 5% { transform: translateX(0); }
                100% { transform: translateX(-${scrollDistance}px); }
            }
        `

        // Add keyframes to document
        const style = document.createElement('style')
        style.textContent = keyframes
        document.head.appendChild(style)

        // Apply animation
        labelEl.style.animation = `${keyframeName} ${animationDuration}s infinite`

        // Store the style element for cleanup
        labelEl.setAttribute('data-keyframe-style', style.id = `keyframe-${keyframeName}`)

        console.log('Animation applied:', labelEl.style.animation)
    }
}

watch(
    () => userStore.userInfo,
    (newUserInfo) => {
        if (newUserInfo) {
            loadUserDatabases()
        }
    },
    { immediate: true }
)
</script>

<style scoped>
/* Enhanced tree styling */
.custom-tree {
    width: 100%;
}

.custom-tree :deep(.el-tree-node__content) {
    overflow: hidden !important;
    width: 100% !important;
    padding-right: 8px !important;
    border-radius: 6px !important;
    transition: all 0.2s ease !important;
}

.custom-tree :deep(.el-tree-node__content:hover) {
    background-color: rgba(255, 255, 255, 0.08) !important;
}

.custom-tree :deep(.el-tree-node__label) {
    overflow: hidden !important;
    flex: 1 !important;
    min-width: 0 !important;
}

/* Enhanced tree node content styling */
.tree-node-content {
    width: 100%;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    position: relative;
}

.tree-node-content:hover {
    background-color: rgba(255, 255, 255, 0.05);
    transform: translateX(2px);
}

/* Label container with better overflow handling */
.label-container {
    position: relative;
    overflow: hidden;
    flex: 1;
    min-width: 0;
    max-width: 100%;
}

/* Enhanced fade effect */
.label-container::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 20px;
    height: 100%;
    background: linear-gradient(to right, transparent, rgba(10, 10, 18, 0.9));
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: 1;
}

.tree-node-content:hover .label-container::after {
    opacity: 1;
}

/* Tree label with improved animation support */
.tree-label {
    display: inline-block;
    transform: translateX(0);
    transition: transform 0.2s ease;
    will-change: transform;
    white-space: nowrap;
    position: relative;
}

/* Different styles for different node types */
.tree-node-content[data-type="database"] {
    font-weight: 600;
}

.tree-node-content[data-type="space"] {
    font-weight: 500;
    padding-left: 12px;
}

.tree-node-content[data-type="column"] {
    font-weight: 400;
    padding-left: 16px;
    font-size: 0.9em;
}

/* Accessibility improvements */
.tree-node-content:focus-visible {
    outline: 2px solid #06b6d4;
    outline-offset: 2px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .tree-node-content {
        padding: 6px 4px;
    }

    .label-container::after {
        width: 15px;
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .tree-label {
        animation: none !important;
    }

    .tree-node-content:hover {
        transform: none;
    }

    .tree-label {
        transition: none;
    }
}

/* Custom dropdown styles */
:deep(.el-dropdown-menu) {
    background-color: #1e293b;
    border: 1px solid rgba(6, 182, 212, 0.2);
    min-width: 280px;
}

:deep(.el-dropdown-menu__item:hover) {
    background-color: rgba(6, 182, 212, 0.1);
}
</style>