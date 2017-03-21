import { exec } from 'child_process'
import { colorExists } from '../utils/colors'
import listeners from '../utils/listeners'
import pluginWrapperFactory from './PluginWrapper'

export const defaultOptions = {
  colors: {
    general: 'lightCyan',
    dirty: 'yellow',
    push: 'lightGreen',
    pull: 'lightRed'
  },
  showBranch: true,
  showDirtyCount: true,
  showPushCount: true,
  showPullCount: true,
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

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    width: '14px',
    height: '14px',
    marginLeft: '5px'
  },
  element: {
    marginLeft: '3px'
  },
}

export function componentFactory(React, colors) {
  const { Component, PropTypes } = React

  const PluginWrapper = pluginWrapperFactory(React)

  const BranchIcon = ({ fillColor, style }) => (
    <svg className="statline_plugin_icon" style={style}
        viewBox="0 0 9 12" xmlns="http://www.w3.org/2000/svg">
      <path fill={fillColor} fillRule="evenodd" d={
        'M9,3.42857746 C9,2.47714888 8.199,1.71429174 7.2,1.71429174 ' +
        'C6.38694194,1.71224578 5.67412749,2.23130264 5.46305602,2.97909871 ' +
        'C5.25198454,3.72689478 5.59545317,4.51637741 6.3,4.90286317 L6.3,' +
        '5.16000603 C6.282,5.60572031 6.093,6.00000603 5.733,6.34286317 ' +
        'C5.373,6.68572031 4.959,6.86572031 4.491,6.88286317 C3.744,' +
        '6.90000603 3.159,7.02000603 2.691,7.26857746 L2.691,3.18857746 ' +
        'C3.39554683,2.8020917 3.73901546,2.01260907 3.52794398,1.26481299 ' +
        'C3.31687251,0.517016923 2.60405806,-0.00203993415 1.791,' +
        '6.02687385e-06 C0.792,6.02687385e-06 9.99200722e-17,0.76286317 ' +
        '9.99200722e-17,1.71429174 C0.00385823026,2.32305356 0.346419835,' +
        '2.88420209 0.9,3.18857746 L0.9,8.8114346 C0.369,9.1114346 0,' +
        '9.66000603 0,10.2857203 C0,11.2371489 0.801,12.000006 1.8,12.000006 ' +
        'C2.799,12.000006 3.6,11.2371489 3.6,10.2857203 C3.6,9.8314346 3.42,' +
        '9.42857746 3.123,9.12000603 C3.204,9.06857746 3.555,8.76857746 ' +
        '3.654,8.71714888 C3.879,8.62286317 4.158,8.5714346 4.5,8.5714346 ' +
        'C5.445,8.52857746 6.255,8.18572031 6.975,7.50000603 C7.695,' +
        '6.81429174 8.055,5.80286317 8.1,4.9114346 L8.082,4.9114346 C8.631,' +
        '4.60286317 9,4.05429174 9,3.42857746 L9,3.42857746 Z M1.8,' +
        '0.685720313 C2.394,0.685720313 2.88,1.15714888 2.88,1.71429174 ' +
        'C2.88,2.2714346 2.385,2.74286317 1.8,2.74286317 C1.215,2.74286317 ' +
        '0.72,2.2714346 0.72,1.71429174 C0.72,1.15714888 1.215,0.685720313 ' +
        '1.8,0.685720313 L1.8,0.685720313 Z M1.8,11.3228632 C1.206,' +
        '11.3228632 0.72,10.8514346 0.72,10.2942917 C0.72,9.73714888 1.215,' +
        '9.26572031 1.8,9.26572031 C2.385,9.26572031 2.88,9.73714888 2.88,' +
        '10.2942917 C2.88,10.8514346 2.385,11.3228632 1.8,11.3228632 L1.8,' +
        '11.3228632 Z M7.2,4.46572031 C6.606,4.46572031 6.12,3.99429174 6.12,' +
        '3.43714888 C6.12,2.88000603 6.615,2.40857746 7.2,2.40857746 C7.785,' +
        '2.40857746 8.28,2.88000603 8.28,3.43714888 C8.28,3.99429174 7.785,' +
        '4.46572031 7.2,4.46572031 L7.2,4.46572031 Z'
      } />
    </svg>
  )

  BranchIcon.propTypes = {
    fillColor: PropTypes.string,
    style: PropTypes.object
  }

  const DirtyIcon = ({ fillColor, style }) => (
    <svg style={style} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <path fill={fillColor} fillRule="evenodd" d={
        'M11.1428571,0 L0.857142857,0 C0.385714286,0 0,0.385714286 0,0.857142857 ' +
        'L0,11.1428571 C0,11.6142857 0.385714286,12 0.857142857,12 L11.1428571,12 ' +
        'C11.6142857,12 12,11.6142857 12,11.1428571 L12,0.857142857 C12,0.385714286 ' +
        '11.6142857,0 11.1428571,0 L11.1428571,0 Z M11.1428571,11.1428571 L0.857142857,' +
        '11.1428571 L0.857142857,0.857142857 L11.1428571,0.857142857 L11.1428571,' +
        '11.1428571 L11.1428571,11.1428571 Z M3.42857143,6 C3.42857143,4.57714286 ' +
        '4.57714286,3.42857143 6,3.42857143 C7.42285714,3.42857143 8.57142857,' +
        '4.57714286 8.57142857,6 C8.57142857,7.42285714 7.42285714,8.57142857 6,' +
        '8.57142857 C4.57714286,8.57142857 3.42857143,7.42285714 3.42857143,6 ' +
        'L3.42857143,6 Z'
      } />
    </svg>
  )

  DirtyIcon.propTypes = {
    fillColor: PropTypes.string,
    style: PropTypes.object
  }

  const PushIcon = ({ fillColor, style }) => (
    <svg style={style} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <path fill={fillColor} fillRule="evenodd" transform="rotate(-90 6,6)" d={
        'M5.14285714,6.85714286 L2.57142857,6.85714286 L2.57142857,' +
        '5.14285714 L5.14285714,5.14285714 L5.14285714,2.57142857 ' +
        'L9.42857143,6 L5.14285714,9.42857143 L5.14285714,6.85714286 ' +
        'L5.14285714,6.85714286 Z M12,0.857142857 L12,11.1428571 C12,' +
        '11.6142857 11.6142857,12 11.1428571,12 L0.857142857,12 C0.385714286,' +
        '12 0,11.6142857 0,11.1428571 L0,0.857142857 C0,0.385714286 ' +
        '0.385714286,0 0.857142857,0 L11.1428571,0 C11.6142857,0 12,' +
        '0.385714286 12,0.857142857 L12,0.857142857 Z M11.1428571,' +
        '0.857142857 L0.857142857,0.857142857 L0.857142857,11.1428571 ' +
        'L11.1428571,11.1428571 L11.1428571,0.857142857 L11.1428571,' +
        '0.857142857 Z'
       } />
    </svg>
  )

  PushIcon.propTypes = {
    fillColor: PropTypes.string,
    style: PropTypes.object
  }

  const PullIcon = ({ fillColor, style }) => (
    <svg style={style} viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
      <path fill={fillColor} fillRule="evenodd" transform="rotate(90 6,6)" d={
        'M5.14285714,6.85714286 L2.57142857,6.85714286 L2.57142857,' +
        '5.14285714 L5.14285714,5.14285714 L5.14285714,2.57142857 ' +
        'L9.42857143,6 L5.14285714,9.42857143 L5.14285714,6.85714286 ' +
        'L5.14285714,6.85714286 Z M12,0.857142857 L12,11.1428571 C12,' +
        '11.6142857 11.6142857,12 11.1428571,12 L0.857142857,12 C0.385714286,' +
        '12 0,11.6142857 0,11.1428571 L0,0.857142857 C0,0.385714286 ' +
        '0.385714286,0 0.857142857,0 L11.1428571,0 C11.6142857,0 12,' +
        '0.385714286 12,0.857142857 L12,0.857142857 Z M11.1428571,' +
        '0.857142857 L0.857142857,0.857142857 L0.857142857,11.1428571 ' +
        'L11.1428571,11.1428571 L11.1428571,0.857142857 L11.1428571,' +
        '0.857142857 Z'
       } />
    </svg>
  )

  PullIcon.propTypes = {
    fillColor: PropTypes.string,
    style: PropTypes.object
  }

  return class extends Component {
    static displayName() {
      return 'Git plugin'
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

      this.pid = null

      this.handleClick = () => {
        // if (this.state.remote) {
        //   shell.openExternal(this.state.remote)
        // }
      }

      this.state = {
        branch: null,
        remote: null,
        dirty: 0,
        push: 0,
        pull: 0
      }

      this.removeListener = listeners.add((store, action) => {
        const uids = store.getState().sessions.sessions
        if (action.type === 'SESSION_XTERM_SET_TITLE') {
          this.pid = uids[action.uid].pid
        } else if (action.type === 'SESSION_ADD') {
          this.pid = action.pid
          this.setAll(this.pid)
        } else if (action.type === 'SESSION_ADD_DATA') {
          const enterKey = action.data.indexOf('\n') > 0
          if (enterKey) {
            this.setAll(this.pid)
          }
        } else if (action.type === 'SESSION_SET_ACTIVE') {
          this.pid = uids[action.uid].pid
          this.setAll(this.pid)
        }
      })
    }

    componentWillUnmount() {
      this.removeListener()
    }

    render() {
      const color = {
        general: colors[this.options.colors.general],
        dirty: colors[this.options.colors.dirty],
        push: colors[this.options.colors.push],
        pull: colors[this.options.colors.pull]
      }

      let componentContents
      if (this.state.branch) {
        const getStyle = (color) => Object.assign({}, styles.element, { color })
        const children = []
        children.push(<span>{this.state.branch}</span>)
        if (this.state.dirty) {
          children.push(<DirtyIcon fillColor={color.dirty} style={styles.icon} />)
          children.push(<span style={getStyle(color.dirty)}>{this.state.dirty}</span>)
        }
        if (this.state.push) {
          children.push(<PushIcon fillColor={color.push} style={styles.icon} />)
          children.push(<span style={getStyle(color.push)}>{this.state.push}</span>)
        }
        if (this.state.pull) {
          children.push(<PullIcon fillColor={color.pull} style={styles.icon} />)
          children.push(<span style={getStyle(color.pull)}>{this.state.pull}</span>)
        }
        componentContents = (
          <div title={this.state.remote} style={styles.container}>
            {children}
          </div>
        )
      } else {
        componentContents = (
          <div title="Not a Git repository" style={styles.container}>
            <span>-</span>
          </div>
        )
      }

      return (
        <PluginWrapper color={color.general} onClick={this.handleClick}>
          <BranchIcon fillColor={color.general} /> {componentContents}
        </PluginWrapper>
      )
    }

    setAll(pid) {
      /* eslint-disable quotes */
      exec(
        `lsof -p ${pid} | grep cwd | tr -s ' ' | cut -d ' ' -f9-`,
        (err, cwd) => {
          cwd = cwd.trim()
          exec(
            `git symbolic-ref --short HEAD || git rev-parse --short HEAD`,
            { cwd },
            (err, branch) => {
              if (branch) {
                this.setState({ branch })
                this.setRemote(cwd)
                this.setDirty(cwd)
                this.setArrows(cwd)
              } else {
                this.setState({
                  branch: null,
                  remote: null,
                  dirty: 0,
                  push: 0,
                  pull: 0
                })
              }
            }
          )
        }
      )
    }

    setRemote(cwd) {
      /* eslint-disable quotes */
      exec(`git config --get remote.origin.url`, { cwd }, (err, remote) => {
        remote = remote.trim()
          .replace(/^git@(.*?):/, 'https://$1/')
          .replace(/[A-z0-9\-]+@/, '')
          .replace(/\.git$/, '')

        this.setState({ remote: remote || null })
      })
    }

    setDirty(cwd) {
      /* eslint-disable quotes */
      exec(
        `git status --porcelain --ignore-submodules -unormal`,
        { cwd },
        (err, dirty) => {
          dirty = dirty.split('\n').length - 1
          this.setState({ dirty })
        }
      )
    }

    setArrows(cwd) {
      /* eslint-disable quotes */
      exec(
        `git rev-list --left-right --count HEAD...@'{u}' 2>/dev/null`,
        { cwd },
        (err, arrows) => {
          arrows = arrows.split('\t')

          this.setState({
            push: Number(arrows[0]),
            pull: Number(arrows[1])
          })
        }
      )
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

    if (!colors.dirty) {
      errors.push('\'colors.dirty\' color string is required but missing.')
    } else if (!colorExists(colors.dirty)) {
      errors.push(`invalid color '${colors.dirty}'`)
    }

    if (!colors.push) {
      errors.push('\'colors.push\' color string is required but missing.')
    } else if (!colorExists(colors.push)) {
      errors.push(`invalid color '${colors.push}'`)
    }

    if (!colors.pull) {
      errors.push('\'colors.pull\' color string is required but missing.')
    } else if (!colorExists(colors.pull)) {
      errors.push(`invalid color '${colors.pull}'`)
    }
  }

  return errors
}
