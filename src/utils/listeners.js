class ListenerBag {
  constructor() {
    this.obj = {}
    this.inc = 0
  }

  add(listener) {
    const index = this.inc++
    this.obj[index] = listener
    return () => delete this.obj[index]
  }

  handle(store, action) {
    Object.keys(this.obj).forEach((key) => {
      this.obj[key](store, action)
    })
  }
}

export default new ListenerBag()
