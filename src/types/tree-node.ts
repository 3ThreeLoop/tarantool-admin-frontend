export interface TreeNode {
    id: string
    label: string
    type: 'database' | 'space' | 'column'
    db_uuid?: string
    space_name?: string
    column_info?: {
        name: string
        type: string
        is_nullable: boolean
    }
    level: number
    isLeaf?: boolean
    children?: TreeNode[]
}

export interface DBForm {
    db_name: string
    host: string
    port: number
    username: string
    password: string
}

export interface UserDatabase {
    db_uuid: string
    db_name: string
}

export interface DatabaseDetail {
    db_name: string
    db_uuid: string
    spaces: Space[]
}

export interface Space {
    name: string
    format: Column[]
}

export interface Column {
    name: string
    type: string
    is_nullable: boolean
}