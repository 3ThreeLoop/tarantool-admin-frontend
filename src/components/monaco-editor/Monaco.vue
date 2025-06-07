<template>
    <div ref="containerRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
// import github from 'monaco-themes/themes/GitHub Dark.json'

// Register the theme once before creating the editor
// monaco.editor.defineTheme('github', github as monaco.editor.IStandaloneThemeData)
// monaco.editor.setTheme('github')

const tarantoolDarkTheme: monaco.editor.IStandaloneThemeData = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: '', foreground: 'D4D4D4', background: '1E1E2F' },
        { token: 'keyword', foreground: '56B6C2', fontStyle: 'bold' },
        { token: 'identifier', foreground: '9CDCFE' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    ],
    colors: {
        'editor.background': '#1E1E2F',
        'editor.foreground': '#D4D4D4',
        'editorCursor.foreground': '#00FFFF',
        'editor.lineHighlightBackground': '#2A2A3D',
        'editorLineNumber.foreground': '#5A5A85',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
    },
}



const props = defineProps<{
    modelValue: string
    language?: string
    theme?: string
}>()
const emit = defineEmits(['update:modelValue'])

const containerRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
    if (containerRef.value) {
        // Register the theme
        monaco.editor.defineTheme('tarantool-dark', tarantoolDarkTheme)

        editor = monaco.editor.create(containerRef.value, {
            value: props.modelValue,
            language: props.language || 'sql',
            theme: 'tarantool-dark',
            automaticLayout: true,
        })

        editor.onDidChangeModelContent(() => {
            emit('update:modelValue', editor!.getValue())
        })
    }
})


watch(() => props.modelValue, (newVal) => {
    if (editor && editor.getValue() !== newVal) {
        editor.setValue(newVal)
    }
})

onBeforeUnmount(() => {
    if (editor) {
        editor.dispose()
    }
})
</script>

<style scoped>
div {
    width: 100%;
    height: 100%;
}
</style>
