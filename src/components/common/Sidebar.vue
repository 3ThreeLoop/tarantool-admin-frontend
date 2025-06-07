<template>
    <div class="w-[300px] h-[calc(100vh-65px)] relative overflow-hidden">
        <!-- Background layer -->
        <div class="absolute inset-0"></div>

        <!-- Pattern overlay with proper mask -->
        <div class="absolute inset-0 bg-[#16213e3a]" :style="{
            WebkitMask: 'url(/images/pattern.svg) no-repeat center/cover',
            mask: 'url(/images/pattern.svg) no-repeat center/cover'
        }"></div>

        <!-- Content layer -->
        <div class="relative z-10 p-4 text-white">
            <h2 class="mb-4 text-3xl font-inter font-semibold">My Database</h2>
            <el-tree :renderContent="renderContent" style="max-width: 600px" :data="treeData" :props="defaultProps"
                @node-click="handleNodeClick" />

            <el-divider />
            <!-- Enhanced Add Database Button -->
            <div class="mt-6">
                <el-button class="add-database-btn" size="large" color="#00d4ff">
                    <div class="flex items-center gap-2 py-1">
                        <el-icon class="add-icon">
                            <Plus />
                        </el-icon>
                        <span class="btn-text">Add Database</span>
                    </div>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { h } from 'vue'

interface Tree {
    label: string
    children?: Tree[]
}

const handleNodeClick = (data: Tree) => {
    console.log(data)
}

const data: Tree[] = [
    {
        label: 'db_cockfight',
        children: [
            {
                label: 'users_space',
                children: [{ label: 'user_uuid' }],
            },
        ],
    },
    {
        label: 'db_mtda',
        children: [
            {
                label: 'users_space',
                children: [{ label: 'user_uuid' }],
            },
            {
                label: 'submissions_space',
                children: [{ label: 'submission_uuid' }],
            },
        ],
    },
    {
        label: 'db_khmerlottery',
        children: [
            {
                label: 'users_space',
                children: [{ label: 'user_uuid' }],
            },
            {
                label: 'posts_space',
                children: [{ label: 'post_uuid' }],
            },
        ],
    },
]

const defaultProps = {
    children: 'children',
    label: 'label',
}

const addLevelToTree = (nodes: Tree[], level = 1): Tree[] => {
    return nodes.map(node => {
        const newNode = { ...node, level }
        if (node.children) {
            newNode.children = addLevelToTree(node.children, level + 1)
        }
        return newNode
    })
}

const treeData = addLevelToTree(data)

const renderContent = (_: any, { data }: any) => {
    let iconName = ''

    switch (data.level) {
        case 1:
            iconName = 'fluent-color:book-database-16'
            break
        case 2:
            iconName = 'fluent-color:table-16'
            break
        case 3:
        default:
            iconName = 'streamline-plump-color:insert-column-flat'
            break
    }

    return h('div', { class: 'flex items-center gap-2' }, [
        h(Icon, { icon: iconName, width: 18, height: 18 }),
        h('span', null, data.label),
    ])
}

</script>

<style scoped>
/* Alternative CSS approach if inline styles don't work */
/* .pattern-mask {
  -webkit-mask-image: url('/images/pattern.svg');
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: cover;
  mask-image: url('/images/pattern.svg');
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: cover;
} */
</style>