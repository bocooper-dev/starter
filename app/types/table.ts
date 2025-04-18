export interface TableCellParams<T> {
  row: {
    getValue: (key: string) => any
    original: T
  }
}

export interface TableColumn<T> {
  accessorKey?: keyof T
  header: string
  id?: string
  cell?: (params: TableCellParams<T>) => any
}
