<template>
    <div class="h-full flex flex-col select-none">

        <!-- Top: Query Area -->
        <div :style="{ height: topHeight + 'px' }" ref="topPane"
            class="bg-[linear-gradient(135deg,_#0a0a23,_#1a1a2e,_#16213e)] flex flex-col">
            <el-button-group class="bg-black p-2">
                <el-tooltip content="click to run query" placement="bottom" effect="customized">
                    <el-button type="primary" color="#00d4ff">
                        <Icon icon="mingcute:play-fill" width="18" height="18" />
                    </el-button>
                </el-tooltip>
                <el-tooltip content="open file" placement="bottom" effect="customized">
                    <el-button type="primary" color="#00d4ff">
                        <Icon icon="entypo:folder" width="18" height="18" />
                    </el-button>
                </el-tooltip>
                <el-tooltip content="save query" placement="bottom" effect="customized">
                    <el-button type="primary" color="#00d4ff">
                        <Icon icon="lets-icons:save-fill" width="18" height="18" />
                    </el-button>
                </el-tooltip>
            </el-button-group>
            <div class="flex-1 w-full overflow-hidden">
                <Monaco language="sql" v-model="sql" />
            </div>
            <!-- <el-input type="textarea" class="flex-1 w-full" :autosize="false" resize="none"
                input-style=" height:100%; resize: none;" style="--el-border-radius-base: none" /> -->
        </div>

        <!-- Drag Handle -->
        <div class="h-1 bg-[linear-gradient(45deg,_#006aff,_#00d4ff)] cursor-row-resize" @mousedown="startDragging">
        </div>

        <!-- Bottom: Table Area -->
        <div class="bg-[linear-gradient(135deg,_#0a0a23,_#1a1a2e,_#16213e)] flex-1 flex flex-col overflow-hidden">
            <!-- scroll wrapper -->
            <div class="flex-1 overflow-y-auto overflow-x-auto">
                <el-table :data="tableData" border style="min-width: max-content" height="100%" show-overflow-tooltip>
                    <el-table-column type="selection" width="55" />
                    <el-table-column v-for="col in columns" :key="col.prop" :prop="col.prop" sortable show-overflow-tooltip>
                        <template #header>
                            <div class="flex items-center gap-2" style="flex: 1;">
                                <span class="font-bold text-base">{{ col.label }}</span>
                                <span class="text-xs border px-2 border-[#00d4ff] text-[#00d4ff] rounded-2xl">
                                    {{ col.type }}
                                </span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>

    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import Monaco from '@/components/monaco-editor/Monaco.vue'

const sql = ref("SELECT * FORM users_space")

interface Column {
    prop: string
    label: string
    type: string
}

const columns = ref<Column[]>([
    { prop: 'date', label: 'Date', type: 'timestamp' },
    { prop: 'name', label: 'Name', type: 'text' },
    { prop: 'address', label: 'Address', type: 'varchar' },
])

const tableData = ref([
    { date: '2025-06-07', name: 'John Doe', address: '123 Main St' },
    { date: '2025-06-06', name: 'Jane Smith', address: '456 Elm St' },
    { date: '2025-06-05', name: 'Sam Green', address: '789 Oak St' },
])
const topPane = ref<HTMLElement | null>(null)
// const textarea = ref<string>('')
const topHeight = ref<number>(window.innerHeight * 0.4)
let isDragging = false

const startDragging = (e: MouseEvent) => {
    isDragging = true
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', stopDragging)
}

const minTopHeight = 100
const minBottomHeight = 150

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

// Optional: clean up on component unmount
onUnmounted(() => {
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

/* Ensure your custom content doesn't take full width */
:deep(.el-table th .cell > div) {
    flex: 1;
}
:deep(.el-table .el-table__header-wrapper .el-table__header thead th) {
  background-color: black !important; /* Your desired color */
}

/* Only apply space-between to headers that have your custom template */
:deep(.el-table th .cell) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important; /* Default to center */
}

/* Only for headers with multiple child elements (your custom template) */
:deep(.el-table th .cell:has(div.flex)) {
    justify-content: space-between !important;
}

/* Ensure selection column stays centered */
:deep(.el-table-column--selection .cell) {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    height: 100%;
}
/* Optional: Change header text color */
/* :deep(.el-table .el-table__header-wrapper .el-table__header thead th .cell) {
  color: #00d4ff !important;
} */
</style>
