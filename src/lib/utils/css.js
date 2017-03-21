export function toString(value, ending = 'px') {
  return (typeof value === 'string' && value.endsWith(ending))
    ? value : value + ending
}

export function toNumber(value, ending = 'px') {
  return Number((typeof value === 'string' && value.endsWith(ending))
    ? value.slice(0, -ending.length) : value)
}

export function splitCompound(value) {
  if (typeof value === 'string') {
    const values = value.split(' ')
    if (values.length === 4) {
      return {
        top: values[0],
        right: values[1],
        down: values[2],
        left: values[3]
      }
    } else if (values.length === 3) {
      return {
        top: values[0],
        right: values[1],
        down: values[2],
        left: values[1],
      }
    } else if (values.length === 2) {
      return {
        top: values[0],
        right: values[1],
        down: values[0],
        left: values[1],
      }
    } else {
      return {
        top: values[0],
        right: values[0],
        down: values[0],
        left: values[0],
      }
    }
  }
  return value
}
