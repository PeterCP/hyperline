import * as git from './git'
import * as cwd from './cwd'
import * as battery from './battery'
import * as network from './network'
import * as cpu from './cpu'
import * as memory from './memory'
import * as ip from './ip'
import * as hostname from './hostname'
import * as uptime from './uptime'

/**
 * Exports a mapping from plugin name to associated component factory.
 * Object keys match those used in the configuration object
 */
export default {
  git,
  cwd,
  battery,
  network,
  cpu,
  memory,
  ip,
  hostname,
  uptime
}
