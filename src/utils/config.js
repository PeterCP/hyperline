import plugins from '../plugins'

function isObject(item) {
  return (
    item &&
    typeof item === 'object' &&
    !Array.isArray(item)
  )
}

function deepMerge(target, ...sources) {
  if (!sources.length) {
    return target
  }

  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, { [key]: {} })
        }
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

function getPluginFromListByName(pluginList, name) {
  return pluginList.find(each => each.name === name)
}

function mergePluginConfigs(defaultPlugins, userPlugins, notify) {
  if (!userPlugins) {
    return defaultPlugins
  }

  return userPlugins.reduce((newPlugins, plugin) => {
    const newPlugin = Object.assign({}, plugin)
    const { name, options = false } = plugin

    if (typeof plugin !== 'object' || Array.isArray(plugin)) {
      notify('StatLine', '\'plugins\' array members in \'.hyper.js\' must be objects.')
      return newPlugins
    }

    const defaultPlugin = getPluginFromListByName(defaultPlugins, name)

    if (!defaultPlugin || !defaultPlugin.options) {
      notify('StatLine', `Plugin with name "${name}" does not exist.`)
      return newPlugins
    }

    const defaultOptions = defaultPlugin.options

    newPlugin.options = deepMerge({}, defaultOptions, options || {})

    const { validateOptions: validator = false } = plugins[name]
    if (validator) {
      const errors = validator(newPlugin.options)
      if (errors.length > 0) {
        errors.forEach(error => notify(`StatLine '${name}' plugin`, error))
        newPlugin.options = defaultOptions
      }
    }

    return [ ...newPlugins, newPlugin ]
  }, [])
}

function getDefaultPluginConfig(plugins) {
  return Object.keys(plugins).reduce((pluginsArray, pluginName) => {
    const { defaultOptions } = plugins[pluginName]

    const plugin = {
      name: pluginName,
      options: defaultOptions
    }

    return [ ...pluginsArray, plugin ]
  }, [])
}

export function getPluginConfig(userPluginConfig, notify) {
  return mergePluginConfigs(
    getDefaultPluginConfig(plugins),
    userPluginConfig,
    notify
  )
}

