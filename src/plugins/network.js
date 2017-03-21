import { networkStats } from 'systeminformation'
import { colorExists } from '../utils/colors'
import pluginWrapperFactory from './PluginWrapper'

export const defaultOptions = {
  color: 'lightCyan',
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
    <svg className="statline_plugin_icon" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <g fill={fillColor} transform="translate(1.000000, 1.000000)">
          <g>
            <path d={
              'M0,10 L7,10 L7,11 L0,11 L0,10 Z M1,11 L6,11 L6,12 L1,' +
              '12 L1,11 Z M2,12 L5,12 L5,13 L2,13 L2,12 Z M3,13 L4,13 L4,14 ' +
              'L3,14 L3,13 Z M2,3 L5,3 L5,10 L2,10 L2,3 Z'
            }></path>
            <path d={
              'M8,2 L13,2 L13,3 L8,3 L8,2 Z M9,1 L12,1 L12,2 L9,2 L9,1 Z ' +
              'M10,0 L11,0 L11,1 L10,1 L10,0 Z M7,3 L14,3 L14,4 L7,4 L7,3 Z ' +
              'M9,4 L12,4 L12,11 L9,11 L9,4 Z'
            }></path>
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
      return 'Network Speed plugin'
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
        download: 0,
        upload: 0
      }

      this.networkPromises = []
    }

    componentDidMount() {
      this.getSpeed()
      this.interval = setInterval(
        () => this.getSpeed(),
        this.options.interval
      );
    }

    componentWillUnmount() {
      clearInterval(this.interval)
      this.networkPromises.reduce((items, item) => {
        if (typeof item.cancel !== 'undefined') {
          item.cancel()
        }
        return [ ...items, item ]
      }, [])
    }

    getSpeed() {
      this.networkPromises.push(
        networkStats().then(data => this.setState(this.buildStateObject(data)))
      )
    }

    buildStateObject(data) {
      let rawDownload = data.rx_sec / 1024
      if (rawDownload < 0 || isNaN(rawDownload)) {
        rawDownload = 0
      }

      let rawUpload = data.tx_sec / 1024
      if (rawUpload < 0 || isNaN(rawUpload)) {
        rawUpload = 0
      }

      return {
        download: rawDownload.toFixed(),
        upload: rawUpload.toFixed()
      }
    }

    render() {
      const PluginWrapper = pluginWrapperFactory(React)
      const fillColor = colors[this.options.color]

      return (
        <PluginWrapper color={fillColor}>
          <PluginIcon fillColor={fillColor} /> {this.state.download}kB/s {this.state.upload}kB/s
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
