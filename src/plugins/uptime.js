import os from 'os'
import { colorExists } from '../utils/colors'
import pluginWrapperFactory from './PluginWrapper'

export const defaultOptions = {
  color: 'lightYellow',
  interval: 60000 * 5
}

function getInstanceOptions(colors, defaults, config) {
  const options = Object.assign({}, defaults, config)
  if (!colorExists(options.color)) {
    options.color = defaults.color
  }
  return options
}

export function componentFactory(React, colors) {
  const { Component, PropTypes } = React

  const PluginIcon = ({ fillColor }) => (
    <svg className="statline_plugin_icon" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <g fill={fillColor} transform="translate(1.000000, 1.000000)">
          <g>
            <path d="M0,0 L14,0 L14,14 L0,14 L0,0 Z M1,1 L13,1 L13,13 L1,13 L1,1 Z"></path>
            <path d="M6,2 L7,2 L7,7 L6,7 L6,2 Z M6,7 L10,7 L10,8 L6,8 L6,7 Z"></path>
          </g>
        </g>
      </g>
    </svg>
  )

  PluginIcon.propTypes = {
    fillColor: PropTypes.string
  }

  return class extends Component {
    static displayName() {
      return 'Uptime plugin'
    }

    static propTypes() {
      return {
        options: PropTypes.object
      }
    }

    constructor(props) {
      super(props)

      this.options = getInstanceOptions(colors, defaultOptions, props.options)

      this.state = {
        uptime: this.getUptime()
      }
    }

    componentDidMount() {
      // Recheck every 5 minutes
      this.interval = setInterval(() => ({
        uptime: this.setState(this.getUptime())
      }), this.options.interval)
    }

    componentWillUnmount() {
      clearInterval(this.interval)
    }

    getUptime() {
      return (os.uptime()/3600).toFixed(0)
    }

    render() {
      const PluginWrapper = pluginWrapperFactory(React)
      const fillColor = colors[this.options.color]

      return (
        <PluginWrapper color={fillColor}>
          <PluginIcon fillColor={fillColor} /> {this.state.uptime}HRS
        </PluginWrapper>
      )
    }
  }
}

// export const validateOptions = (options) => {
//   const errors = []

//   if (!options.color) {
//     errors.push('\'color\' color string is required but missing.')
//   } else if (!colorExists(options.color)) {
//     errors.push(`invalid color '${options.color}'`)
//   }

//   return errors
// }
