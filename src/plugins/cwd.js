import { exec } from 'child_process'
import tildify from 'tildify'
import { colorExists } from '../utils/colors'
import listeners from '../utils/listeners'
import pluginWrapperFactory from './PluginWrapper'

export const defaultOptions = {
  color: 'lightGreen',
  tildify: true
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

  const FolderIcon = ({ fillColor }) => (
    <svg className="statline_plugin_icon" viewBox="0 0 14 12"
        xmlns="http://www.w3.org/2000/svg">
      <path fill={fillColor} fillRule="evenodd" d={
        'M13,2 L7,2 L7,1 C7,0.34 6.69,0 6,0 L1,0 C0.45,0 0,0.45 0,1 L0,11 ' +
        'C0,11.55 0.45,12 1,12 L13,12 C13.55,12 14,11.55 14,11 L14,3 C14,' +
        '2.45 13.55,2 13,2 L13,2 Z M6,2 L1,2 L1,1 L6,1 L6,2 L6,2 Z'
      } />
    </svg>
  )

  FolderIcon.propTypes = {
    fillColor: PropTypes.string,
    style: PropTypes.object
  }

  return class extends Component {
    static displayName() {
      return 'Current Working Directory plugin'
    }

    static propTypes() {
      return {
        options: PropTypes.objects
      }
    }

    constructor(props) {
      super(props)

      // this.handleClick.bind(this)
      this.options = getInstanceOptions(colors, defaultOptions, props.options)

      this.handleClick = () => {
        // if (this.state.dir) {
        //   shell.openExternal('file://' + this.state.dir)
        // }
      }

      this.pid = null

      this.state = {
        dir: null
      }

      this.removeListener = listeners.add((store, action) => {
        const uids = store.getState().sessions.sessions
        if (action.type === 'SESSION_XTERM_SET_TITLE') {
          this.pid = uids[action.uid].pid
        } else if (action.type === 'SESSION_ADD') {
          this.pid = action.pid
          this.setDir(this.pid)
        } else if (action.type === 'SESSION_ADD_DATA') {
          const enterKey = action.data.indexOf('\n') > 0
          if (enterKey) {
            this.setDir(this.pid)
          }
        } else if (action.type === 'SESSION_SET_ACTIVE') {
          this.pid = uids[action.uid].pid
          this.setDir(this.pid)
        }
      })
    }

    componentWillUnmount() {
      this.removeListener()
    }

    render() {
      const color = colors[this.options.color]

      return (
        <PluginWrapper color={color} onClick={this.handleClick}>
          <FolderIcon fillColor={color} /> {this.options.tildify ?
            tildify(this.state.dir || '') : this.state.dir
          }
        </PluginWrapper>
      )
    }

    setDir(pid) {
      exec(
        `lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`,
        (err, cwd) => {
          cwd = cwd.trim()
          this.setState({ dir: cwd || null })
        }
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
