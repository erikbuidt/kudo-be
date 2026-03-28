import type { IPaginationMeta } from "@/common/interfaces/common.interface"

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function toSnakeCaseMeta(meta: any): IPaginationMeta {
  return {
    total_items: meta.totalItems ?? meta.total_items,
    item_count: meta.itemCount ?? meta.item_count,
    items_per_page: meta.itemsPerPage ?? meta.items_per_page,
    total_pages: meta.totalPages ?? meta.total_pages,
    current_page: meta.currentPage ?? meta.current_page,
  }
}

export const generateNameId = ({ name, id }: { name: string; id: string }) => {
  return `${removeSpecialCharacter(name).replace(/\s/g, "-")}-i-${id}`
}
export const removeSpecialCharacter = (str: string) =>
  // eslint-disable-next-line no-useless-escape
  str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|:|;|'|"|&|#|\[|\]|~|\$|_|`|-|\{|\}|\||\\/g, "")
