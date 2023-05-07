export class Chart {
  constructor(element) {
    this.element = element
    element.liteChart = this
  }

  createLayout() {
    this.element.classList.add('lite-chart')
    this.element.classList.add(`lite-chart--${this.cssModificator}`)
    this.chartWrapper = document.createElement('div')
    this.chartWrapper.classList = 'lite-chart__wrapper'
    this.canvas = document.createElement('canvas')
    this.chartWrapper.append(this.canvas)
    this.element.append(this.chartWrapper)

    this.ctx = this.canvas.getContext('2d')
  }

  mainRender() {
    this.ctx.clearRect(0, 0, this.params.width, this.params.height)

    this.render()
  }

  setMainParameters() {
    this.params = {}
    this.params.width = this.canvas.offsetWidth
    this.params.height = this.canvas.offsetHeight

    if (this.setParameters) this.setParameters()
  }

  setSize() {
    delete this.canvas.width
    delete this.canvas.height
    this.canvas.width = this.params.width
    this.canvas.height = this.params.height
  }

  setEvents() {
    if (this.options.iteraction) {
      this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this))
      this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this))
    }

    window.addEventListener('resize', () => {
      this.setMainParameters()
      this.setSize()
      this.drawChart()
    })
  }

  renderTooltip(tooltipData, xCoord, yCoord) {
    if (this.tooltipElement) {
      this.tooltipElement.innerHTML = ''
    } else {
      this.tooltipElement = document.createElement('div')
      this.tooltipElement.classList.add('lite-chart__tooltip')
    }

    this.tooltipElement.innerHTML = tooltipData.label
      ? `
      <div class="lite-chart__tooltip-label">${tooltipData.label}</div>
      <div class="lite-chart__tooltip-value">${tooltipData.value}</div>
    `
      : `
      <div class="lite-chart__tooltip-value">${tooltipData.value}</div>
    `

    this.tooltipElement.style.setProperty('--center-x', `${xCoord}px`)
    this.tooltipElement.style.setProperty('--center-y', `${yCoord}px`)
    this.chartWrapper.append(this.tooltipElement)
    this.tooltipElement.classList.add('active')
  }

  removeTooltip() {
    if (this.tooltipElement) {
      this.tooltipElement.classList.remove('active')
    }
  }

  startAnimation() {
    this.animationStartTime = Date.now()
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this))
  }

  stopAnimation() {
    cancelAnimationFrame(this.animationFrameId)
  }

  interpolateColor(startColor, endColor, coefficient) {
    const startRGB = this.hexToRGB(startColor)
    const endRGB = this.hexToRGB(endColor)
    const interpolatedRGB = startRGB.map((startValue, index) => {
      const endValue = endRGB[index]
      const delta = (endValue - startValue) * coefficient
      return Math.floor(startValue + delta)
    })
    return this.rgbToHex(interpolatedRGB)
  }

  hexToRGB(hex) {
    const red = Number.parseInt(hex.slice(1, 3), 16)
    const green = Number.parseInt(hex.slice(3, 5), 16)
    const blue = Number.parseInt(hex.slice(5, 7), 16)
    return [red, green, blue]
  }

  rgbToHex(rgb) {
    const [red, green, blue] = rgb
    const redHex = red.toString(16).padStart(2, '0')
    const greenHex = green.toString(16).padStart(2, '0')
    const blueHex = blue.toString(16).padStart(2, '0')
    return `#${redHex}${greenHex}${blueHex}`
  }

  lightenColor(hexColor) {
    const rgbColor = this.hexToRGB(hexColor)
    const lightenRGB = rgbColor.map((value) => Math.min(value + this.options.lightenValue, 255))
    return this.rgbToHex(lightenRGB)
  }

  update(data, options = {}) {
    this.data = data
    this.options = Object.assign({}, this.options, options)
    this.setMainParameters()

    this.localUpdate()

    this.mainRender()
  }
}
