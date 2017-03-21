export default (React) => {
  const PluginWrapper = ({ color, children }) => {
    let style = color ? { color } : {}

    return (
      <div style={style} className="hyperline_plugin">
        {children}
      </div>
    )
  }

  PluginWrapper.propTypes = {
    color: React.PropTypes.string,
    children: React.PropTypes.any
  }

  return PluginWrapper
}
