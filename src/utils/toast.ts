import { ElMessage } from 'element-plus'
import { h } from 'vue'

type ToastType = 'success' | 'warning' | 'info' | 'error'
type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

interface ToastOptions {
    message: string
    type?: ToastType
    duration?: number
    offset?: number
    customClass?: string
    desc?: string
    position?: ToastPosition
}

const typeColorMap: Record<ToastType, string> = {
  success: '--el-color-success',
  warning: '--el-color-warning',
  info: '--el-color-info',
  error: '--el-color-error',
}

export const showToast = ({
    message,
    type = 'info',
    duration = 3000,
    offset = 20,
    desc,
    position = 'top-right',
}: ToastOptions & { position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' }) => {
    const colorVariable = typeColorMap[type]
    const positionClass = `custom-toast-${position}`

    const vnode = h('div', [
        h('div', { style: `font-weight: 500; color:var(${colorVariable})` }, message),
        desc ? h('div', { style: `font-size: 0.85rem; opacity: 0.8; color:var(${colorVariable})` }, desc) : null,
    ])

    ElMessage({
        message: vnode,
        type,
        duration,
        offset,
        grouping: true,
        showClose: true,
        customClass: `${positionClass}`.trim(),
    })
}
