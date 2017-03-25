import os from 'os'
import { colorExists } from '../utils/colors'
import pluginWrapperFactory from './PluginWrapper'

export const defaultOptions = {
  colors: {
    general: 'lightBlue',
    high: 'lightRed',
    moderate: 'lightYellow',
    low: 'lightGreen'
  },
  interval: 2000,
  expanded: false
}

function getInstanceOptions(colors, defaults, config) {
  const options = Object.assign({}, defaults, config)
  for (let key of Object.keys(defaults.colors)) {
    if (!colorExists(options.colors[key])) {
      options.colors[key] = defaults.colors[key]
    }
  }
  return options
}

export function componentFactory(React, colors) {
  const { Component, PropTypes } = React

  const PluginIcon = ({ fillColor, style }) => (
    <svg className="statline_plugin_icon" style={style} xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <g fill={fillColor} transform="translate(1.000000, 1.000000)">
          <g>
            <path d={
              'M3,3 L11,3 L11,11 L3,11 L3,3 Z M4,4 ' +
              'L10,4 L10,10 L4,10 L4,4 Z'
            }></path>
            <rect x="5" y="5" width="4" height="4"></rect>
            <rect x="4" y="0" width="1" height="2"></rect>
            <rect x="6" y="0" width="1" height="2"></rect>
            <rect x="8" y="0" width="1" height="2"></rect>
            <rect x="5" y="12" width="1" height="2"></rect>
            <rect x="7" y="12" width="1" height="2"></rect>
            <rect x="9" y="12" width="1" height="2"></rect>
            <rect x="12" y="3" width="2" height="1"></rect>
            <rect x="12" y="5" width="2" height="1"></rect>
            <rect x="12" y="7" width="2" height="1"></rect>
            <rect x="12" y="9" width="2" height="1"></rect>
            <rect x="0" y="4" width="2" height="1"></rect>
            <rect x="0" y="4" width="2" height="1"></rect>
            <rect x="0" y="6" width="2" height="1"></rect>
            <rect x="0" y="8" width="2" height="1"></rect>
            <rect x="0" y="10" width="2" height="1"></rect>
          </g>
        </g>
      </g>
    </svg>
  )

  PluginIcon.propTypes = {
    fillColor: PropTypes.string,
    style: PropTypes.object
  }

  return class extends Component {
    static displayName() {
      return 'CPU plugin'
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
        cpus: [],
        avg: 0
      }
      this.calculateCpuUsage()
    }

    componentDidMount() {
      this.interval = setInterval(() => {
        this.calculateCpuUsage()
      }, this.options.interval)
    }

    componentWillUnmount() {
      clearInterval(this.interval)
    }

    // calculateCpuUsage() {
    //   let totalIdle = 0,
    //     totalTick = 0,
    //     idle,
    //     total,
    //     averageCpuUsage

    //   const cpus = os.cpus()

    //   for (let i = 0, len = cpus.length; i < len; i++) {
    //     const cpu = cpus[i]

    //     for (let type in cpu.times) {
    //       if ( cpu.times.hasOwnProperty(type)) {
    //         totalTick += cpu.times[type]
    //       }
    //     }

    //     totalIdle += cpu.times.idle
    //   }

    //   idle = totalIdle / cpus.length
    //   total = totalTick / cpus.length

    //   if (this.info && this.info.idleCpu) {
    //     const idleDifference = idle - this.info.idleCpu,
    //       totalDifference = total - this.info.totalCpu
    //     averageCpuUsage = 100 - ~~(100 * idleDifference / totalDifference)
    //   } else {
    //     averageCpuUsage = 0
    //   }

    //   this.info = {
    //     idleCpu: idle,
    //     totalCpu: total
    //   }

    //   return averageCpuUsage
    // }

    calculateCpuUsage() {
      const cpus = os.cpus().map((cpu, index) => {
        const
          times = cpu.times,
          cpuInfo = this.state.cpus.find(cpu => cpu.index == index)

        let
          idle = times.idle,
          total = Object.keys(times).reduce((tot, key) => tot + times[key], 0),
          percentage

        if (cpuInfo) {
          total -= cpuInfo.total
          idle -= cpuInfo.idle
          percentage = 100 - ~~(100 * idle / total)
        } else {
          percentage = 0
        }

        return {
          index,
          total,
          idle,
          percentage
        }
      })

      let avg = cpus.reduce((agg, cpu) => {
        agg.total += cpu.total
        agg.idle += cpu.idle
        return agg
      }, { total: 0, idle: 0 })
      avg = 100 - ~~(100 * avg.idle / avg.total)

      this.setState({ cpus, avg })
    }

    getColor(percentage) {
      const colors = this.options.colors

      if (percentage < 50) {
        return colors.low
      } else if (percentage < 75) {
        return colors.moderate
      } else {
        return colors.high
      }
    }

    render() {
      const
        PluginWrapper = pluginWrapperFactory(React),
        getColor = (percentage) => colors[this.getColor(percentage)]

      if (this.options.expanded) {
        const fillColor = colors[this.options.colors.general]
        return (
          <PluginWrapper color={fillColor}>
            <PluginIcon fillColor={fillColor} style={{ marginRight: 0 }} />
            {this.state.cpus.map(cpu => (
              <div style={{ marginLeft: '5px' }}>
                {cpu.index}:
                <span style={{ color: getColor(cpu.percentage) }}>{cpu.percentage}%</span>
              </div>
            ))}
          </PluginWrapper>
        )
      } else {
        const fillColor = getColor(this.state.avg)

        return (
          <PluginWrapper color={fillColor}>
            <PluginIcon fillColor={fillColor} /> {this.state.avg}%
          </PluginWrapper>
        )
      }
    }
  }
}

export const validateOptions = ({ colors = false }) => {
  const errors = []

  if (!colors) {
    errors.push('\'colors\' object is required but missing.')
  } else {
    if (!colors.general) {
      errors.push('\'colors.general\' color string is required but missing.')
    } else if (!colorExists(colors.general)) {
      errors.push(`invalid color '${colors.general}'`)
    }

    if (!colors.high) {
      errors.push('\'colors.high\' color string is required but missing.')
    } else if (!colorExists(colors.high)) {
      errors.push(`invalid color '${colors.high}'`)
    }

    if (!colors.moderate) {
      errors.push('\'colors.moderate\' color string is required but missing.')
    } else if (!colorExists(colors.moderate)) {
      errors.push(`invalid color '${colors.moderate}'`)
    }

    if (!colors.low) {
      errors.push('\'colors.low\' color string is required but missing.')
    } else if (!colorExists(colors.low)) {
      errors.push(`invalid color '${colors.low}'`)
    }
  }

  return errors
}
