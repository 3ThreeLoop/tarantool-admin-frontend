<template>
    <div ref="containerRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor'
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

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

const emit = defineEmits<{
    'update:modelValue': [value: string]
    'selection-change': [selection: string]
}>()

const containerRef = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null

// Methods to expose to parent component
const getEditor = () => editor

const getSelection = (): string => {
    if (editor) {
        const selection = editor.getSelection()
        if (selection) {
            return editor.getModel()?.getValueInRange(selection) || ''
        }
    }
    return ''
}

const getSelectedText = (): string => {
    return getSelection()
}

const hasSelection = (): boolean => {
    if (editor) {
        const selection = editor.getSelection()
        return selection ? !selection.isEmpty() : false
    }
    return false
}

const selectAll = () => {
    if (editor) {
        const model = editor.getModel()
        if (model) {
            const fullRange = model.getFullModelRange()
            editor.setSelection(fullRange)
        }
    }
}

const clearSelection = () => {
    if (editor) {
        const position = editor.getPosition()
        if (position) {
            editor.setSelection(new monaco.Selection(position.lineNumber, position.column, position.lineNumber, position.column))
        }
    }
}

const insertText = (text: string) => {
    if (editor) {
        const selection = editor.getSelection()
        if (selection) {
            editor.executeEdits('', [{
                range: selection,
                text: text,
                forceMoveMarkers: true
            }])
        }
    }
}

const formatCode = () => {
    if (editor) {
        editor.getAction('editor.action.formatDocument')?.run()
    }
}

onMounted(() => {
    if (containerRef.value) {
        // Register the theme
        monaco.editor.defineTheme('tarantool-dark', tarantoolDarkTheme)

        editor = monaco.editor.create(containerRef.value, {
            value: props.modelValue,
            language: props.language || 'sql',
            theme: 'tarantool-dark',
            automaticLayout: true,
            minimap: {
                enabled: false
            },
            scrollBeyondLastLine: false,
            fontSize: 14,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            glyphMargin: true,
            useTabStops: false,
            tabSize: 2,
        })

        // Listen for content changes
        editor.onDidChangeModelContent(() => {
            emit('update:modelValue', editor!.getValue())
        })

        // Listen for selection changes
        editor.onDidChangeCursorSelection((e) => {
            const selectedText = getSelection()
            emit('selection-change', selectedText)
        })

        // Add keyboard shortcuts
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            // This will be handled by the parent component
            // We just need to ensure the selection is properly detected
        })

        editor.addCommand(monaco.KeyCode.F5, () => {
            // This will be handled by the parent component
            // We just need to ensure the selection is properly detected
        })

        // Add context menu items
        editor.addAction({
            id: 'execute-selection',
            label: 'Execute Selection',
            contextMenuGroupId: 'navigation',
            contextMenuOrder: 1.5,
            run: () => {
                // Emit a custom event that parent can listen to
                const selectedText = getSelection()
                if (selectedText.trim()) {
                    // Parent component should handle this
                    console.log('Execute selection requested:', selectedText)
                } else {
                    console.log('Execute all requested')
                }
            }
        })

        editor.addAction({
            id: 'format-sql',
            label: 'Format SQL',
            contextMenuGroupId: 'edit',
            keybindings: [
                monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF
            ],
            run: () => {
                formatCode()
            }
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

// Expose methods to parent component
defineExpose({
    getEditor,
    getSelection,
    getSelectedText,
    hasSelection,
    selectAll,
    clearSelection,
    insertText,
    formatCode
})
</script>

<style scoped>
div {
    width: 100%;
    height: 100%;
}
</style>