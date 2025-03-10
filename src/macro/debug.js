import { SPACE_ID } from './../contants'

const formatProp = classes =>
  classes
    // Replace the "stand-in spaces" with real ones
    .replace(new RegExp(SPACE_ID, 'g'), ' ')
    // Normalize spacing
    .replace(/\s\s+/g, ' ')
    // Remove newline characters
    .replace(/\n/g, ' ')
    .trim()

const addDataTwPropToPath = ({
  t,
  attributes,
  rawClasses,
  path,
  state,
  propName = 'data-tw',
}) => {
  const dataTwPropAllEnvironments =
    propName === 'data-tw' && state.configTwin.dataTwProp === 'all'
  const dataCsPropAllEnvironments =
    propName === 'data-cs' && state.configTwin.dataCsProp === 'all'
  if (state.isProd && !dataTwPropAllEnvironments && !dataCsPropAllEnvironments)
    return
  if (propName === 'data-tw' && !state.configTwin.dataTwProp) return
  if (propName === 'data-cs' && !state.configTwin.dataCsProp) return

  // Remove the existing debug attribute if you happen to have it
  const dataProperty = attributes.filter(
    // TODO: Use @babel/plugin-proposal-optional-chaining
    p => p.node && p.node.name && p.node.name.name === propName
  )
  dataProperty.forEach(path => path.remove())

  const classes = formatProp(rawClasses)

  // Add the attribute
  path.insertAfter(
    t.jsxAttribute(t.jsxIdentifier(propName), t.stringLiteral(classes))
  )
}

const addDataPropToExistingPath = ({
  t,
  attributes,
  rawClasses,
  path,
  state,
  propName = 'data-tw',
}) => {
  const dataTwPropAllEnvironments =
    propName === 'data-tw' && state.configTwin.dataTwProp === 'all'
  const dataCsPropAllEnvironments =
    propName === 'data-cs' && state.configTwin.dataCsProp === 'all'
  if (state.isProd && !dataTwPropAllEnvironments && !dataCsPropAllEnvironments)
    return
  if (propName === 'data-tw' && !state.configTwin.dataTwProp) return
  if (propName === 'data-cs' && !state.configTwin.dataCsProp) return

  // Append to the existing debug attribute
  const dataProperty = attributes.find(
    // TODO: Use @babel/plugin-proposal-optional-chaining
    p => p.node && p.node.name && p.node.name.name === propName
  )
  if (dataProperty) {
    try {
      // Existing data prop
      if (dataProperty.node.value.value) {
        dataProperty.node.value.value = `${[
          dataProperty.node.value.value,
          rawClasses,
        ]
          .filter(Boolean)
          .join(' | ')}`
        return
      }

      // New data prop
      dataProperty.node.value.expression.value = `${[
        dataProperty.node.value.expression.value,
        rawClasses,
      ]
        .filter(Boolean)
        .join(' | ')}`
    } catch (_) {}

    return
  }

  const classes = formatProp(rawClasses)

  // Add a new attribute
  path.pushContainer(
    'attributes',
    t.jSXAttribute(
      t.jSXIdentifier(propName),
      t.jSXExpressionContainer(t.stringLiteral(classes))
    )
  )
}

export { addDataTwPropToPath, addDataPropToExistingPath }
