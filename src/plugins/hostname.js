import os from 'os'
import { colorExists } from '../utils/colors'
import pluginWrapperFactory from './PluginWrapper'

export const defaultOptions = {
  color: 'lightBlue',
  username: false
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
  const PluginWrapper = pluginWrapperFactory(React)

  const PluginIcon = ({ fillColor }) => (
    <svg className="statline_plugin_icon" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <g fill={fillColor} transform="translate(1.000000, 1.000000)">
          <path d={
            'M2,0 L12,0 L12,8 L2,8 L2,0 Z M4,2 L10,2 L10,6 L4,6 L4,2 Z ' +
            'M5.5,11 L8.5,11 L8.5,14 L5.5,14 L5.5,11 Z M11,11 L14,11 L14,14 ' +
            'L11,14 L11,11 Z M0,11 L3,11 L3,14 L0,14 L0,11 Z M6.5,10 L7.5,10 ' +
            'L7.5,11 L6.5,11 L6.5,10 Z M12,10 L13,10 L13,11 L12,11 L12,10 Z ' +
            'M1,10 L2,10 L2,11 L1,11 L1,10 Z M1,9 L13,9 L13,10 L1,10 L1,9 Z ' +
            'M6.5,8 L7.5,8 L7.5,9 L6.5,9 L6.5,8 Z'
          }></path>
        </g>
      </g>
    </svg>
  )

  PluginIcon.propTypes = {
    fillColor: PropTypes.string
  }

  return class extends Component {
    static displayName() {
      return 'Hostname plugin'
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
        hostname: os.hostname(),
        username: os.userInfo().username
      }
    }

    getDisplay() {
      if (this.options.username) {
        return this.state.username + '@' + this.state.hostname
      } else {
        return this.state.hostname
      }
    }

    render() {
      const fillColor = colors[this.options.color]

      return (
        <PluginWrapper color={fillColor}>
          <PluginIcon fillColor={fillColor} /> {this.getDisplay()}
        </PluginWrapper>
      )
    }
  }
}

export const validateOptions = options => {
  const errors = []

  if (!options.color) {
    errors.push('\'color\' color string is required but missing.')
  } else if (!colorExists(options.color)) {
    errors.push(`invalid color '${options.color}'`)
  }

  return errors
}
