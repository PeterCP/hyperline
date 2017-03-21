import { mem } from 'systeminformation'
import { colorExists } from '../utils/colors'
import pluginWrapperFactory from './PluginWrapper'

export const defaultOptions = {
  color: 'white',
  interval: 1000
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
    <svg className="hyperline_plugin_icon" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <g fill={fillColor}>
          <g id="memory" transform="translate(1.000000, 1.000000)">
            <path d="M3,0 L11,0 L11,14 L3,14 L3,0 Z M4,1 L10,1 L10,13 L4,13 L4,1 Z"></path>
            <rect x="5" y="2" width="4" height="10"></rect>
            <rect x="12" y="1" width="2" height="1"></rect>
            <rect x="12" y="3" width="2" height="1"></rect>
            <rect x="12" y="5" width="2" height="1"></rect>
            <rect x="12" y="9" width="2" height="1"></rect>
            <rect x="12" y="7" width="2" height="1"></rect>
            <rect x="12" y="11" width="2" height="1"></rect>
            <rect x="0" y="1" width="2" height="1"></rect>
            <rect x="0" y="3" width="2" height="1"></rect>
            <rect x="0" y="5" width="2" height="1"></rect>
            <rect x="0" y="9" width="2" height="1"></rect>
            <rect x="0" y="7" width="2" height="1"></rect>
            <rect x="0" y="11" width="2" height="1"></rect>
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
      return 'Memory plugin'
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
        activeMemory: 0,
        totalMemory: 0
      }

      mem().then(m => {
        this.state = {
          activeMemory: this.getMb(m.active),
          totalMemory: this.getMb(m.total)
        }
      })

    }

    componentDidMount() {
      this.interval = setInterval(() => (
        mem().then(m => {
          this.setState({activeMemory: this.getMb(m.active)})
        })
      ), this.options.interval)
    }

    componentWillUnmount() {
      clearInterval(this.interval)
    }

    getMb(bytes) {
      return (bytes / (1024 * 1024)).toFixed(0) + 'MB'
    }

    render() {
      const PluginWrapper = pluginWrapperFactory(React)
      const fillColor = colors[this.props.options.color]

      return (
        <PluginWrapper color={fillColor}>
          <PluginIcon fillColor={fillColor} /> {this.state.activeMemory} / {this.state.totalMemory}
        </PluginWrapper>
      )
    }
  }
}

export const validateOptions = (options) => {
  const errors = []

  if (!options.color) {
    errors.push('\'color\' color string is required but missing.')
  } else if (!colorExists(options.color)) {
    errors.push(`invalid color '${options.color}'`)
  }

  return errors
}
