/**
 * Metadata option and label helper functions for academic year lookup table.
 *
 * These functions retrieve metadata records from the database and return
 * structured arrays suitable for populating GOV.UK checkbox and select
 * components. Each category also includes a label function to convert a
 * code into a human-readable name.
 *
 * All records are sorted by `code` (varchar) and then `name` (varchar).
 */

const { AcademicYear } = require('../models')

/**
 * Generic function to retrieve ordered lookup options
 */
const getOptions = async (model, where = {}) => {
  const rows = await model.findAll({
    where,
    order: [['code', 'ASC'], ['name', 'ASC']]
  })
  return rows.map(row => ({
    text: row.name,
    value: row.code,
    id: row.id
  }))
}

/**
 * Generic function to retrieve label for a given code
 */
const getLabel = async (model, code) => {
  const row = await model.findOne({ where: { code } })
  return row?.name || `Unknown (${code})`
}

module.exports = {
  getAcademicYearOptions: () => getOptions(AcademicYear),
  getAcademicYearLabel: (code) => getLabel(AcademicYear, code),
}
