/**
 * helpers/search.js
 *
 * Utilities for:
 * - Normalising checkbox/radio inputs
 * - Building "selected filters" UI data (compatible with GOV.UK selected filters pattern)
 * - Fetching option lists
 * - Parsing/storing filters per search mode (location/provider)
 */

const {
  getRegionOptions,
  getRegionLabel,
  getSchoolTypeOptions,
  getSchoolTypeLabel,
  getSchoolGroupOptions,
  getSchoolGroupLabel,
  getSchoolStatusOptions,
  getSchoolStatusLabel,
  getSchoolEducationPhaseOptions,
  getSchoolEducationPhaseLabel
} = require('./gias')

/**
 * @typedef {Object} OptionItem
 * @property {string} text - Human-readable label for an option.
 * @property {string} value - Code/value submitted by the form.
 * @property {string} [id] - Optional stable identifier (UUID).
 */

/**
 * @typedef {Object} SelectedFilterItem
 * @property {string} text - Human-readable label to display as a chip.
 * @property {string} href - URL that removes this specific selection.
 */

/**
 * @typedef {Object} SelectedFilterCategory
 * @property {{ text: string }} heading - Category heading (e.g. "School type").
 * @property {SelectedFilterItem[]} items - Items (“chips”) in this category.
 */

/**
 * @typedef {Object} SelectedFilters
 * @property {SelectedFilterCategory[]} categories
 */

/**
 * @callback LabelGetter
 * @param {string} code
 * @returns {Promise<string>} - Resolved label for a given code.
 */

/**
 * @callback RemoveHref
 * @param {string} code
 * @returns {string} - HREF that removes the code when followed.
 */

/**
 * @typedef {Object} SelectedFilterGroupConfig
 * @property {string} key
 * @property {string} heading
 * @property {string[]|undefined} [selected]
 * @property {LabelGetter} labelGetter
 * @property {RemoveHref} removeHref
 */

/**
 * @typedef {Object} ParsedFilters
 * @property {string|null} radius
 * @property {string[]} schoolType
 * @property {string[]} schoolGroup
 * @property {string[]} schoolStatus
 * @property {string[]} schoolEducationPhase
 * @property {string[]} region
 */

/**
 * Normalise checkbox/radio POSTed values.
 *
 * Accepts either:
 *  - `name`: a direct value or array from the current request (preferred)
 *  - `data`: a fallback value or array (e.g. from session/query)
 *
 * Special case:
 *  - Filters out the sentinel value `_unchecked` (used by some forms to ensure a POST key exists).
 *
 * @param {string|string[]|undefined|null} name - Primary source value(s).
 * @param {string|string[]|undefined|null} data - Fallback value(s) if `name` is not provided.
 * @returns {string[]|undefined} - Normalised array of values, or `undefined` if neither provided.
 *
 * @example
 * // With a single checkbox value:
 * getCheckboxValues('A', undefined) // ['A']
 *
 * @example
 * // With an array from checkboxes:
 * getCheckboxValues(['A', 'B'], undefined) // ['A','B']
 *
 * @example
 * // Filters out sentinel:
 * getCheckboxValues('_unchecked', undefined) // []
 */
const getCheckboxValues = (name, data) => {
  return name && (Array.isArray(name)
    ? name
    : [name].filter((name) => {
        return name !== '_unchecked'
      })) || data && (Array.isArray(data) ? data : [data])
}

/**
 * Remove a single value from an array of selected filter values.
 *
 * @param {string} value - The value/code to remove.
 * @param {string[]|undefined|null} data - Existing selection(s).
 * @returns {string[]|null} - Array without the value, or `null` if input was not an array.
 */
const removeFilter = (value, data) => {
  if (Array.isArray(data)) {
    return data.filter(item => item !== value)
  } else {
    return null
  }
}

// Local static list of supported search radii (miles)
const radii = [
  {
    id: '9ac0ef3d-e54c-4838-8921-7fb0fcb19934',
    name: '10 miles',
    code: '10'
  },
  {
    id: '5aff0aa3-701d-481d-931a-dd1040c0fbb5',
    name: '25 miles',
    code: '25'
  },
  {
    id: '45065bec-1e77-47f8-a246-17cb06d31ac9',
    name: '50 miles',
    code: '50'
  }
]

/**
 * Get option items for the Radius filter (static).
 * @returns {Promise<OptionItem[]>}
 */
const getRadiusOptions = async () => {
  return radii.map(row => ({
    text: row.name,
    value: row.code,
    id: row.id
  }))
}

/**
 * Resolve a human-readable label for a radius code.
 * @param {string} code - e.g. '25'
 * @returns {Promise<string>} - e.g. '25 miles' or 'Unknown (25)'
 */
const getRadiusLabel = async (code) => {
  const row = radii.find(r => r.code === code)
  return row?.name || `Unknown (${code})`
}

/**
 * Parse a positive integer with a fallback.
 *
 * @param {unknown} v - Value to parse (string/number).
 * @param {number} fallback - Fallback if `v` is not a positive finite integer.
 * @returns {number} - Parsed positive integer or the fallback.
 *
 * @example
 * asInt('25', 10) // 25
 * asInt('0', 10)  // 10 (fallback because <= 0)
 * asInt('xx', 10) // 10 (fallback because NaN)
 */
const asInt = (v, fallback) => {
  const n = parseInt(v, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// --- selected filters (UI) builder ------------------------------------------

/**
 * Build the "selected filters" data for the UI from an array of group configs.
 *
 * The returned structure matches what the GOV.UK selected filters macro expects:
 * { categories: [{ heading: { text }, items: [{ text, href }] }] }
 *
 * @param {SelectedFilterGroupConfig[]} groups
 * @returns {Promise<SelectedFilters|null>} - Null if nothing selected.
 *
 * @example
 * const sel = { schoolType: ['PRI','SEC'] }
 * const sf = await buildSelectedFilters([
 *   {
 *     key: 'schoolType',
 *     heading: 'School type',
 *     selected: sel.schoolType,
 *     labelGetter: getSchoolTypeLabel,
 *     removeHref: (code) => `/results/remove-school-type-filter/${code}`
 *   }
 * ])
 * // -> { categories: [ { heading: { text: 'School type' }, items: [...] } ] }
 */
const buildSelectedFilters = async (groups) => {
  const categories = []

  for (const g of groups) {
    if (!g.selected?.length) continue
    const items = await Promise.all(
      g.selected.map(async (code) => ({
        text: await g.labelGetter(code),
        href: g.removeHref(code)
      }))
    )
    categories.push({ heading: { text: g.heading }, items })
  }

  return categories.length ? { categories } : null
}

// --- filter parsing ----------------------------------------------------------

/**
 * Parse/normalise raw filter data (e.g. from `req.session.data.filters` or `req.query.filters`)
 * into consistent arrays for downstream queries. Keeps `radius` as a single string or null.
 *
 * @param {Record<string, any>} [filters={}] - Raw filters object.
 * @returns {ParsedFilters}
 */
const parseFilters = (filters = {}) => ({
  // location mode
  radius: filters.radius ?? null,
  schoolType: Array.isArray(filters.schoolType) ? filters.schoolType : (filters.schoolType ? [filters.schoolType] : []),
  schoolGroup: Array.isArray(filters.schoolGroup) ? filters.schoolGroup : (filters.schoolGroup ? [filters.schoolGroup] : []),
  schoolStatus: Array.isArray(filters.schoolStatus) ? filters.schoolStatus : (filters.schoolStatus ? [filters.schoolStatus] : []),
  schoolEducationPhase: Array.isArray(filters.schoolEducationPhase) ? filters.schoolEducationPhase : (filters.schoolEducationPhase ? [filters.schoolEducationPhase] : []),

  // provider mode
  region: Array.isArray(filters.region) ? filters.region : (filters.region ? [filters.region] : [])
})

/**
 * Check if any of the provided filter keys contain a value.
 *
 * @param {ParsedFilters} f - Parsed filters.
 * @param {Array<keyof ParsedFilters>} keys - Keys to test.
 * @returns {boolean}
 *
 * @example
 * hasAnyFilters(sel, ['schoolType','schoolGroup']) // true/false
 */
const hasAnyFilters = (f, keys) =>
  keys.some((k) => Array.isArray(f[k]) ? f[k].length > 0 : Boolean(f[k]))

// --- option lists fetcher ----------------------------------------------------

/**
 * Fetch option lists for a given search mode.
 *
 * - Shared lists are always loaded (type, group, status, education phase).
 * - Location mode additionally includes radius options.
 * - Provider mode additionally includes region options.
 *
 * @param {'location'|'provider'} mode
 * @returns {Promise<Record<string, OptionItem[]>>}
 *
 * @example
 * const options = await fetchFilterOptions('location')
 * // -> { filterRadiusItems, filterSchoolTypeItems, ... }
 */
const fetchFilterOptions = async (mode) => {
  // shared
  const [
    filterSchoolTypeItems,
    filterSchoolGroupItems,
    filterSchoolStatusItems,
    filterSchoolEducationPhaseItems
  ] = await Promise.all([
    getSchoolTypeOptions(),
    getSchoolGroupOptions(),
    getSchoolStatusOptions(),
    getSchoolEducationPhaseOptions()
  ])

  if (mode === 'location') {
    const filterRadiusItems = await getRadiusOptions()
    return {
      filterRadiusItems,
      filterSchoolTypeItems,
      filterSchoolGroupItems,
      filterSchoolStatusItems,
      filterSchoolEducationPhaseItems
    }
  }

  if (mode === 'provider') {
    const filterRegionItems = await getRegionOptions()
    return {
      filterRegionItems,
      filterSchoolTypeItems,
      filterSchoolGroupItems,
      filterSchoolStatusItems,
      filterSchoolEducationPhaseItems
    }
  }

  return {}
}

// --- per-mode configs for selected-filters UI --------------------------------

/**
 * Selected-filters config for "location" search mode.
 * Pass the parsed selections to get group configs suitable for buildSelectedFilters().
 *
 * @param {ParsedFilters} sel
 * @returns {SelectedFilterGroupConfig[]}
 */
const locationSelectedFilterConfig = (sel) => ([
  // If you re-enable radius chips, uncomment this block
  // {
  //   key: 'radius',
  //   heading: 'Search radius',
  //   selected: sel.radius ? [sel.radius] : [],
  //   labelGetter: getRadiusLabel,
  //   removeHref: (code) => `/results/remove-radius-filter/${code}`
  // },
  {
    key: 'schoolGroup',
    heading: 'School group',
    selected: sel.schoolGroup,
    labelGetter: getSchoolGroupLabel,
    removeHref: (code) => `/results/remove-school-group-filter/${code}`
  },
  {
    key: 'schoolType',
    heading: 'School type',
    selected: sel.schoolType,
    labelGetter: getSchoolTypeLabel,
    removeHref: (code) => `/results/remove-school-type-filter/${code}`
  },
  {
    key: 'schoolEducationPhase',
    heading: 'School education phase',
    selected: sel.schoolEducationPhase,
    labelGetter: getSchoolEducationPhaseLabel,
    removeHref: (code) => `/results/remove-school-education-phase-filter/${code}`
  },
  {
    key: 'schoolStatus',
    heading: 'School status',
    selected: sel.schoolStatus,
    labelGetter: getSchoolStatusLabel,
    removeHref: (code) => `/results/remove-school-status-filter/${code}`
  }
])

/**
 * Selected-filters config for "provider" search mode.
 *
 * @param {ParsedFilters} sel
 * @returns {SelectedFilterGroupConfig[]}
 */
const providerSelectedFilterConfig = (sel) => ([
  {
    key: 'region',
    heading: 'Region',
    selected: sel.region,
    labelGetter: getRegionLabel,
    removeHref: (code) => `/results/remove-region-filter/${code}`
  },
  {
    key: 'schoolGroup',
    heading: 'School group',
    selected: sel.schoolGroup,
    labelGetter: getSchoolGroupLabel,
    removeHref: (code) => `/results/remove-school-group-filter/${code}`
  },
  {
    key: 'schoolType',
    heading: 'School type',
    selected: sel.schoolType,
    labelGetter: getSchoolTypeLabel,
    removeHref: (code) => `/results/remove-school-type-filter/${code}`
  },
  {
    key: 'schoolEducationPhase',
    heading: 'School education phase',
    selected: sel.schoolEducationPhase,
    labelGetter: getSchoolEducationPhaseLabel,
    removeHref: (code) => `/results/remove-school-education-phase-filter/${code}`
  },
  {
    key: 'schoolStatus',
    heading: 'School status',
    selected: sel.schoolStatus,
    labelGetter: getSchoolStatusLabel,
    removeHref: (code) => `/results/remove-school-status-filter/${code}`
  }
])

module.exports = {
  getCheckboxValues,
  removeFilter,
  getRadiusOptions,
  getRadiusLabel,
  asInt,
  buildSelectedFilters,
  parseFilters,
  hasAnyFilters,
  fetchFilterOptions,
  locationSelectedFilterConfig,
  providerSelectedFilterConfig
}
