import Color from 'color'
import { toNumber } from './utils/css'
import { getColorList } from './utils/colors'
import { getPluginConfig } from './utils/config'
import listeners from './utils/listeners'
import plugins from './plugins'

// Add statline config to ui state.
export function reduceUI(state, { type, config }) {
  if (type === 'CONFIG_LOAD' || type === 'CONFIG_RELOAD') {
    state = state.set('statline', config.statline);
  }
  return state;
}

// Add statline config from ui state to Hyper component state.
export function mapHyperState({ui: { colors, statline }}, map) {
  return Object.assign({}, map, {
    colors,
    statline
  })
}

// Middleware to allow plugins to listen to action dispatching.
export const middleware = (store) => (next) => (action) => {
  listeners.handle(store, action)
  next(action)
}

// Add statline component to Hyper.
export function decorateHyper(Hyper, { React, notify }) {
  const { Component, PropTypes } = React

  return class extends Component {
    static displayName() {
      return 'Hyper'
    }

    static propTypes() {
      return {
        colors: PropTypes.oneOfType([
          PropTypes.object,
          PropTypes.array
        ]),
        customChildren: PropTypes.array,
        statline: PropTypes.object
      }
    }

    constructor(props, context) {
      super(props, context)
      this.colors = getColorList(props.colors)

      const statline = props.statline || {}
      const pluginConfig = getPluginConfig(statline.plugins, notify)

      // Get Plugin components from config.
      this.plugins = pluginConfig.map(({ name, options }) => ({
        Plugin: plugins[name].componentFactory(React, this.colors),
        options: options
      }))
    }

    render() {
      return <Hyper {...this.props} customChildren={
        Array.from(this.props.customChildren || []).concat(
          <div className="statline">
            <div className="statline_plugin_wrapper">
              {this.plugins.map(({ Plugin, options }, index) => (
                <Plugin key={index} options={options} />
              ))}
            </div>
          </div>
        )
      } />
    }
  }
}

// Add CSS to hyper config.
export function decorateConfig(config) {
  const colors = getColorList(config.colors)

  let statline = config.statline || {}
  statline.css = statline.css || `
    .terms_terms {
      margin-bottom: ${toNumber(config.fontSize) + 14}px;
    }
    .statline {
      display: flex;
      align-items: center;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      overflow: hidden;
      padding: 5px;
      font-family: ${config.fontFamily ||
        'Menlo, DejaVu Sans Mono, Lucida Console, Monospace'
      };
      font-size: ${toNumber(config.fontSize) || 12}px;
      font-style: normal;
    }
    .statline::before {
      content: '';
      position: absolute;
      display: block;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      opacity: 0.4;
      background: ${
        colors[statline.backgroundColor] ||
        statline.backgroundColor ||
        config.backgroundColor
      };
      transition: opacity 250ms ease;
      z-index: -1;
    }
    .statline:hover::before {
      opacity: 0.8;
    }
    .statline ::-webkit-scrollbar {
      display: none;
    }
    .statline_plugin_wrapper {
      display: flex;
      width: auto;
      overflow-x: scroll;
    }
    .statline_plugin {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      padding: 0 7px;
    }
    .statline_plugin:not(:first-child) {
      border-left: 1px solid ${
        Color(
          colors[statline.borderColor] ||
          statline.borderColor ||
          config.foregroundColor
        ).alpha(0.2).rgbaString()
      };
    }
    .statline_plugin_icon {
      margin-right: 5px;
      width: 16px;
      height: 16px;
    }
  `

  config.css += statline.css
  return config
}
