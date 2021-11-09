/**
 * Calculate a quantidade de páginas baseada na quantidade 
 * total de itens e quantidade por página
 * @param {*} totalItems total de itens
 * @param {*} amountPerPage quantidade de itens por página
 * @returns 
 */
export function calculateTotalPages(totalItems, amountPerPage) {
  return Math.ceil(totalItems / amountPerPage)
}