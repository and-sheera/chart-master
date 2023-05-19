import '../styles/style.scss'

export class ChartMaster {
  constructor(element) {
    if (element) {
      this.element = element
      element.chartMaster = this
    }
  }

  static createChart(type, settings) {
    let chart
    switch (type) {
    case 'pie': {
      chart = new PieChart(settings)
      break
    }
    case 'bar': {
      chart = new BarChart(settings)
      break
    }
    case 'line': {
      chart = new LineChart(settings)
      break
    }
    case 'polar': {
      chart = new PolarChart(settings)
      break
    }
    case 'radar': {
      return new RadarChart(settings)
    }
    default: {
      console.error('This chart type was not found')
    }
    }
  }

  createLayout() {
    this.element.classList.add('chart-master')
    this.element.classList.add(`chart-master--${this.cssModificator}`)
    this.chartWrapper = document.createElement('div')
    this.chartWrapper.classList = 'chart-master__wrapper'
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
      this.mainRender()
    })
  }

  renderTooltip(tooltipData, xCoord, yCoord) {
    if (this.tooltipElement) {
      this.tooltipElement.innerHTML = ''
    } else {
      this.tooltipElement = document.createElement('div')
      this.tooltipElement.classList.add('chart-master__tooltip')
    }

    this.tooltipElement.innerHTML = tooltipData.label
      ? `
      <div class="chart-master__tooltip-label">${tooltipData.label}</div>
      <div class="chart-master__tooltip-value">${tooltipData.value}</div>
    `
      : `
      <div class="chart-master__tooltip-value">${tooltipData.value}</div>
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

  drawLegend() {
    if (!this.options.legend) return

    if (!this.legendElement) {
      this.legendElement = document.createElement('div')
      this.legendElement.classList.add('chart-master__legend')
      this.element.append(this.legendElement)
    }

    this.legendElement.innerHTML = ''

    const legendList = document.createElement('ul')
    legendList.classList.add('chart-master__legend-list')
    this.legendElement.append(legendList)

    for (const dataItem of this.data) {
      const legendItem = document.createElement('li')
      legendItem.classList.add('chart-master__legend-item')
      legendList.append(legendItem)

      if (dataItem.color) {
        const colorBox = document.createElement('span')
        colorBox.classList.add('chart-master__legend-color')
        colorBox.style.backgroundColor = dataItem.color
        legendItem.append(colorBox)
      }

      const label = document.createElement('span')
      label.classList.add('chart-master__legend-label')
      label.textContent = dataItem.label
      legendItem.append(label)

      const value = document.createElement('span')
      value.classList.add('chart-master__legend-value')
      value.textContent = this.params.totalValue === undefined ? `${Number.parseFloat(dataItem.value.toFixed(2))}` : `${Number.parseFloat(((dataItem.value / this.params.totalValue) * 100).toFixed(2))}%`
      legendItem.append(value)
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
    const startValues = this.colorToRGBA(startColor)
    const endValues = this.colorToRGBA(endColor)

    const interpolatedValues = startValues.map((startValue, index) => {
      if (index < 3) {
        const endValue = endValues[index]
        const delta = (endValue - startValue) * coefficient
        return Math.round(startValue + delta)
      }
      return startValue
    })

    return `rgba(${interpolatedValues.join(', ')})`
  }

  lightenColor(color, lightenValue) {
    const rgbaValues = this.colorToRGBA(color)

    const lightenRGBA = rgbaValues.map((value, index) => {
      if (index < 3) {
        const newValue = Math.min(value + lightenValue, 255)
        return Math.round(newValue)
      }
      return value
    })
    return `rgba(${lightenRGBA.join(', ')})`
  }

  colorToRGBA(color) {
    if (color.startsWith('#')) {
      return this.hexToRGBA(color)
    } else if (color.startsWith('rgba')) {
      return this.rgbaToRGBA(color)
    } else if (color.startsWith('rgb')) {
      return this.rgbToRGBA(color)
    }
  }

  hexToRGBA(hexColor) {
    const r = Number.parseInt(hexColor.slice(1, 3), 16)
    const g = Number.parseInt(hexColor.slice(3, 5), 16)
    const b = Number.parseInt(hexColor.slice(5, 7), 16)

    return [r, g, b, 1]
  }

  rgbToRGBA(rgbColor) {
    const values = rgbColor.substring(4, rgbColor.length - 1).split(',').map(Number)

    return [...values, 1]
  }

  rgbaToRGBA(rgbaColor) {
    return rgbaColor.substring(5, rgbaColor.length - 1).split(',').map(Number)
  }

  update(data, options = {}) {
    this.data = data
    this.options = Object.assign({}, this.options, options)
    this.setMainParameters()

    this.localUpdate()

    this.mainRender()
  }
}

class RadarChart extends ChartMaster {
  constructor(settings) {
    super(settings.element)

    this.data = settings.data
    this.options = Object.assign({}, RadarChart.defaultOptions, settings.options)

    this.cssModificator = 'radar'
    this.createLayout()

    this.setMainParameters()
    this.setSize()
    this.setDots()
    this.setEvents()

    this.mainRender()
  }

  setParameters() {
    this.params.centerX = this.params.width / 2
    this.params.centerY = this.params.height / 2

    this.params.radius = Math.min(this.params.width, this.params.height) / 2
  }

  setDots() {
    this.dots = []

    const maxDataValue = Math.max(...this.data.map(item => item.value))
    let angle = (90 - (360 / this.data.length / 2)) * Math.PI / 180
    const angleStep = (2 * Math.PI) / this.data.length
    for (const [index, item] of this.data.entries()) {
      const radius = (item.value / maxDataValue) * this.params.radius
      const x = this.params.centerX + radius * Math.cos(angle)
      const y = this.params.centerY + radius * Math.sin(angle)

      angle += angleStep
      this.dots.push({ x, y, value: item.value })
    }
  }

  render() {
    this.drawChart()
    // this.drawLegend()
    if (this.options.labels) this.renderLabels()
    if (this.options.dots) this.drawsDots()
  }

  drawChart() {
    const { canvas, ctx, data, options, params, dots } = this
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const startAngle = (90 - (360 / data.length / 2)) * Math.PI / 180
    const angleStep = (2 * Math.PI) / data.length

    // Draw background grid
    ctx.strokeStyle = options.axesColor
    ctx.lineWidth = options.axesLineWidth

    let angle = startAngle
    for (let index = 0; index < data.length; index++) {
      const x = centerX + params.radius * Math.cos(angle)
      const y = centerY + params.radius * Math.sin(angle)

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.closePath()
      ctx.stroke()
      angle += angleStep
    }

    // Calculate maximum data value
    const maxDataValue = Math.max(...data.map(item => item.value))

    ctx.strokeStyle = '#676767'
    ctx.lineWidth = 1

    ctx.beginPath()

    for (let index = 0; index < options.splitSections; index++) {
      const radius = (maxDataValue / (options.splitSections - 1) * index) / maxDataValue * params.radius
      angle = startAngle
      for (const [jj, value] of data.entries()) {
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)

        if (jj === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
          if (jj === data.length - 1) {
            ctx.lineTo(centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle))
          }
        }
        angle += angleStep
      }
    }
    ctx.closePath()
    ctx.stroke()

    // Draw data polygon
    ctx.strokeStyle = options.gridColor
    ctx.lineWidth = options.gridLineWidth
    ctx.beginPath()
    for (const [index, item] of dots.entries()) {
      if (index === 0) {
        ctx.moveTo(item.x, item.y)
      } else {
        ctx.lineTo(item.x, item.y)
      }
    }
    ctx.closePath()
    ctx.stroke()
    ctx.fillStyle = options.bgSectionColor
    ctx.fill()
  }

  renderLabels() {
    if (this.lablesElement) {
      this.lablesElement.innerHTML = ''
    } else {
      this.lablesElement = document.createElement('div')
      this.lablesElement.classList.add('chart-master__labels')
    }

    // Draw category labels

    let angle = (90 - (360 / this.data.length / 2)) * Math.PI / 180
    const angleStep = (2 * Math.PI) / this.data.length
    for (let index = 0; index < this.data.length; index++) {
      const x = this.params.centerX + (this.params.radius + this.options.labelOffset) * Math.cos(angle)
      const y = this.params.centerY + (this.params.radius + this.options.labelOffset) * Math.sin(angle)

      const label = document.createElement('div')
      label.classList.add('chart-master__label')
      label.style.setProperty('--angle', `${angle * 180 / Math.PI}deg`)
      label.style.setProperty('--x', `${x}px`)
      label.style.setProperty('--y', `${y}px`)

      this.lablesElement.append(label)

      label.textContent = this.data[index].label
      angle += angleStep
    }

    this.chartWrapper.append(this.lablesElement)
  }

  drawsDots() {
    for (const dot of this.dots) {
      this.ctx.fillStyle = this.options.dotColor
      if (this.options.dotBorderWidth) {
        this.ctx.lineWidth = this.options.dotBorderWidth
        this.ctx.strokeStyle = this.options.dotBorderColor
      }
      this.ctx.beginPath()
      this.ctx.arc(dot.x, dot.y, 4, 0, 2 * Math.PI)
      this.ctx.stroke()
      this.ctx.fill()
    }
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    for (const [index, dot] of this.dots.entries()) {
      if (
        mouseX >= dot.x - this.options.dotRadius - this.options.iteractionAdditionalRadius &&
        mouseX <= dot.x + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2 &&
        mouseY >= dot.y - this.options.dotRadius - this.options.iteractionAdditionalRadius &&
        mouseY <= dot.y + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2
      ) {
        this.hoveredDotIndex = index
        break
      } else {
        this.hoveredDotIndex = undefined
      }
    }

    if (this.hoveredDotIndex === undefined) {
      this.backChartState()
    } else {
      if (this.hoveredDotIndex !== this.prevHoveredDotIndex) {
        this.prevHoveredDotIndex = this.hoveredDotIndex

        if (this.options.onDotHover && typeof this.options.onDotHover === 'function') {
          this.options.onDotHover({
            index: this.hoveredDotIndex,
            value: this.dots[this.hoveredDotIndex].value
          })
        }

        if (this.options.tooltip) {
          const tooltipData = {
            value: this.dots[this.hoveredDotIndex].value,
            label: this.options.tooltipLabel
          }
          const ttX = this.dots[this.hoveredDotIndex].x
          const ttY = this.dots[this.hoveredDotIndex].y
          this.removeTooltip()
          this.renderTooltip(tooltipData, ttX, ttY)
        }
      }
    }
  }

  backChartState() {
    if (this.options.tooltip) this.removeTooltip()

    this.hoveredDotIndex = undefined
    this.prevHoveredDotIndex = undefined
  }

  handleMouseLeave() {
    this.backChartState()
  }

  localUpdate() {}
}
RadarChart.defaultOptions = {
  gridLineWidth: 1,
  gridColor: '#565656',
  axesLineWidth: 1,
  axesColor: '#000000',
  splitSections: 8,
  labelOffset: 20,
  labels: true,
  lineWidth: 2,
  colorTransitionDuration: 200,
  bgSectionColor: 'rgba(240, 55, 55, 0.4)',
  tooltip: true,
  dots: true,
  dotColor: '#ffffff',
  dotRadius: 3,
  dotBorderWidth: 2,
  dotBorderColor: '#000000',
  iteraction: true,
  iteractionAdditionalRadius: 5,
  colorTransitionTimingFunction: function (progress) {
    return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
  }
}

class PolarChart extends ChartMaster {
  constructor(settings) {
    super(settings.element)

    this.data = settings.data
    this.options = Object.assign({}, PolarChart.defaultOptions, settings.options)

    this.cssModificator = 'polar'
    this.createLayout()

    this.setMainParameters()
    this.setSize()
    this.setEvents()
    this.setSectors()

    this.mainRender()
  }

  setSectors() {
    this.sectors = []
    let currentAngle = 0
    const emptyPlace = (2 * Math.PI - (this.options.sectorGaps * (this.data.length - 1) * Math.PI / 180))
    const sectorAngle = emptyPlace / this.data.length
    for (const dataItem of this.data) {
      this.sectors.push({
        color: dataItem.color,
        hoverColor: dataItem.hoverColor || this.lightenColor(dataItem.color, this.options.lightenValue),
        currentColor: dataItem.color,
        value: dataItem.value,
        label: dataItem.label,
        radius: dataItem.value / this.params.maxValue * this.params.radius,
        startAngle: currentAngle,
        endAngle: (currentAngle + sectorAngle)
      })

      currentAngle += sectorAngle + (this.options.sectorGaps) * Math.PI / 180
    }
  }

  setParameters() {
    this.params.totalValue = this.data.reduce((sum, dataItem) => sum + dataItem.value, 0)
    this.params.maxValue = Math.max(...this.data.map(item => item.value))
    this.params.padding = this.options.padding + this.options.borderWidth
    this.params.radius = Math.min(this.params.width, this.params.height) / 2 - this.params.padding

    this.params.centerX = this.params.width / 2
    this.params.centerY = this.params.height / 2
  }

  render() {
    this.drawGrid()
    this.drawChart()
    if (this.options.legend) this.drawLegend()
    if (this.options.labels) this.renderLabels()
  }

  drawGrid() {
    for (let index = 0; index < this.options.rings; index++) {
      const ringRadius = this.params.radius * ((index + 1) / this.options.rings)
      this.drawRing(ringRadius)
    }
  }

  renderLabels() {
    if (this.lablesElement) {
      this.lablesElement.innerHTML = ''
    } else {
      this.lablesElement = document.createElement('div')
      this.lablesElement.classList.add('chart-master__labels')
      this.chartWrapper.append(this.lablesElement)
    }
    const ringValueStep = this.params.maxValue / (this.options.rings - 1)
    for (let index = 0; index < this.options.rings; index++) {
      const ringRadius = this.params.radius * ((index + 1) / this.options.rings)
      this.lablesElement.append(this.renderLabel(ringRadius, index * ringValueStep))
    }
  }

  drawRing(radius) {
    this.ctx.beginPath()
    this.ctx.arc(this.params.centerX, this.params.centerY, radius, 0, 2 * Math.PI)
    this.ctx.strokeStyle = this.options.gridColor
    this.ctx.lineWidth = this.options.gridLineWidth
    this.ctx.stroke()
    this.ctx.closePath()
  }

  renderLabel(radius, value) {
    const angle = this.options.axisLabelAngle * Math.PI / 180
    const x = this.params.centerX + radius * Math.cos(angle)
    const y = this.params.centerY + radius * Math.sin(angle)

    const label = document.createElement('div')
    label.classList.add('chart-master__label')
    label.textContent = Math.floor(value)
    label.style.setProperty('--x', `${x}px`)
    label.style.setProperty('--y', `${y}px`)
    return label
  }

  drawChart() {
    for (const sector of this.sectors) {
      this.drawSector(
        sector.startAngle,
        sector.endAngle,
        sector.currentColor,
        sector.radius
      )
    }
  }

  drawSector(startAngle, endAngle, fillColor, radius) {
    this.ctx.beginPath()
    this.ctx.moveTo(this.params.centerX, this.params.centerY)
    this.ctx.arc(this.params.centerX, this.params.centerY, radius, startAngle, endAngle)
    this.ctx.closePath()
    this.ctx.fillStyle = fillColor
    this.ctx.fill()
    if (this.options.borderWidth > 0) {
      this.ctx.strokeStyle = this.options.borderColor
      this.ctx.lineWidth = this.options.borderWidth
      this.ctx.stroke()
    }
  }

  handleMouseMove(event) {
    const { offsetX, offsetY } = event
    const dx = offsetX - this.params.centerX
    const dy = offsetY - this.params.centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    let angle = Math.atan2(dy, dx)
    if (angle < 0) {
      angle += 2 * Math.PI
    }

    const hoverSectorIndex = this.sectors.findIndex(sector => angle > sector.startAngle && angle < sector.endAngle && distance < sector.radius)

    if (hoverSectorIndex === -1) {
      this.backChartState()
    } else {
      if (this.hoverSector !== hoverSectorIndex) {
        if (this.options.onSectortHover && typeof this.options.onSectortHover === 'function') {
          this.options.onSectortHover({
            index: hoverSectorIndex,
            label: this.sectors[hoverSectorIndex].label,
            value: (this.sectors[hoverSectorIndex].value / this.params.totalValue) * 100,
            rawValue: this.sectors[hoverSectorIndex].value
          })
        }
        this.backChartState()

        this.hoverSector = hoverSectorIndex
        this.hoveredSectorColor = this.sectors[hoverSectorIndex].hoverColor

        if (this.options.tooltip) {
          const tooltipData = {
            label: this.sectors[hoverSectorIndex].label,
            value: `${Number.parseFloat(((this.sectors[hoverSectorIndex].value / this.params.totalValue) * 100).toFixed(2))}%`
          }
          const midAngle = (this.sectors[hoverSectorIndex].startAngle + this.sectors[hoverSectorIndex].endAngle) / 2
          const ttX = this.params.centerX + this.sectors[hoverSectorIndex].radius / 2 * Math.cos(midAngle)
          const ttY = this.params.centerY + this.sectors[hoverSectorIndex].radius / 2 * Math.sin(midAngle)
          this.removeTooltip()
          this.renderTooltip(tooltipData, ttX, ttY)
        }

        this.startAnimation()
      }
    }
  }

  handleMouseLeave() {
    this.backChartState()
  }

  backChartState() {
    this.stopAnimation()
    if (this.options.tooltip) this.removeTooltip()

    if (this.hoverSector !== undefined) this.sectors[this.hoverSector].currentColor = this.sectors[this.hoverSector].color
    this.hoverSector = undefined

    this.mainRender()
  }

  animate() {
    if (this.hoverSector !== undefined) {
      const currentTime = Date.now()
      const elapsedTime = currentTime - this.animationStartTime
      const progress = Math.min(elapsedTime / this.options.colorTransitionDuration, 1)
      const colorInterpolationCoefficient = this.options.colorTransitionTimingFunction(progress)

      this.sectors[this.hoverSector].currentColor = this.interpolateColor(
        this.sectors[this.hoverSector].color,
        this.sectors[this.hoverSector].hoverColor,
        colorInterpolationCoefficient
      )

      this.mainRender()

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this))
      }
    }
  }

  localUpdate() {
    this.setSectors()
  }
}

PolarChart.defaultOptions = {
  borderWidth: 0,
  borderColor: '#000000',
  padding: 0,
  legend: true,
  lightenValue: 50,
  tooltip: true,
  labels: true,
  iteraction: true,
  rings: 10,
  sectorGaps: 0,
  gridColor: '#cecece',
  gridLineWidth: 1,
  axisLabelAngle: -90,
  colorTransitionTimingFunction: function (progress) {
    return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
  },
  colorTransitionDuration: 200
}

class BarChart extends ChartMaster {
  constructor(settings) {
    super(settings.element)
    this.data = settings.data
    this.options = Object.assign({}, BarChart.defaultOptions, settings.options)
    this.cssModificator = 'bar'
    this.createLayout()
    this.setMainParameters()
    this.mainRender()
    this.setEvents()
  }

  render() {
    this.setBars()
    this.setSize()
    this.drawChart()
    this.drawLegend()
    if (this.options.labelsX) this.renderLabelsX()
    if (this.options.labelsY) this.renderLabelsY()
  }

  setParameters() {
    this.maxBarValue = 0
    this.minBarValue = 0
    for (const dataItem of this.data) {
      if (dataItem.value > this.maxBarValue) {
        this.maxBarValue = dataItem.value
      }
      if (dataItem.value < this.minBarValue) {
        this.minBarValue = dataItem.value
      }
    }
    this.unitToPx = this.params.height / (Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom)
  }

  setBars() {
    this.bars = []
    const totalBarWidth = this.data.length * this.options.barWidth + (this.data.length - 1) * this.options.barSpacing
    const startX = (this.params.width - totalBarWidth) / 2
    let xCoord = startX
    for (const dataItem of this.data) {
      const barHeight = Math.abs(dataItem.value) * this.unitToPx
      const yCoord = dataItem.value > 0 ? (this.maxBarValue + this.options.paddingTop - dataItem.value) * this.unitToPx + 0.5 : (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5
      this.bars.push({
        value: dataItem.value,
        label: dataItem.label,
        x: xCoord,
        y: yCoord,
        height: barHeight,
        width: this.options.barWidth
      })
      xCoord += this.options.barSpacing + this.options.barWidth
    }
  }

  drawChart() {
    this.drawGrid()
    this.drawBars()
  }

  drawGrid() {
    if (this.options.gridY) this.drawGridY()
    if (this.options.gridX) this.drawGridX()
  }

  drawGridY() {
    const gridStepInUnit = Math.floor((Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom) / this.options.yAxisSplitNumber)
    this.ctx.strokeStyle = this.options.gridYColor
    this.ctx.lineWidth = this.options.gridYWidth
    this.ctx.textAlign = 'right'
    this.ctx.beginPath()
    this.ctx.moveTo(0, (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5)
    this.ctx.lineTo(this.params.width, (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5)

    for (let y = this.maxBarValue + this.options.paddingTop - gridStepInUnit; y > 0; y -= gridStepInUnit) {
      this.ctx.moveTo(0, y * this.unitToPx + 0.5)
      this.ctx.lineTo(this.params.width, y * this.unitToPx + 0.5)
    }
    for (let y = this.maxBarValue + this.options.paddingTop + gridStepInUnit; y < Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop; y += gridStepInUnit) {
      this.ctx.moveTo(0, y * this.unitToPx + 0.5)
      this.ctx.lineTo(this.params.width, y * this.unitToPx + 0.5)
    }
    this.ctx.stroke()
  }

  drawGridX() {
    this.ctx.strokeStyle = this.options.gridXColor
    this.ctx.lineWidth = this.options.gridYWidth
    this.ctx.beginPath()
    const totalBarWidth = this.data.length * this.options.barWidth + (this.data.length - 1) * this.options.barSpacing
    const startX = (this.params.width - totalBarWidth) / 2
    let x = startX - this.options.barSpacing / 2
    for (let index = 0; index < this.data.length + 1; index++) {
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.params.height)
      x += this.options.barSpacing + this.options.barWidth
    }
    this.ctx.stroke()
  }

  drawBars() {
    for (const [index, bar] of this.bars.entries()) {
      this.ctx.fillStyle = index === this.hoveredBarIndex ? this.hoveredBarColor : this.options.barColor
      this.ctx.beginPath()
      this.ctx.roundRect(bar.x, bar.y, this.options.barWidth, bar.height, this.options.barBorderRadius)
      this.ctx.fill()
      if (this.options.barBorderWidth !== 0) {
        this.ctx.strokeStyle = this.options.barBorderColor
        this.ctx.lineWidth = this.options.barBorderWidth
        this.ctx.strokeRect(bar.x, bar.y, this.options.barWidth, bar.height)
        this.ctx.stroke()
      }
    }
  }

  renderLabelsY() {
    if (this.lablesYElement) {
      this.lablesYElement.innerHTML = ''
    } else {
      this.lablesYElement = document.createElement('div')
      this.lablesYElement.classList.add('chart-master__labels')
      this.lablesYElement.classList.add('chart-master__labels--y')
      this.chartWrapper.classList.add('chart-master__wrapper--pl')
    }

    this.labelsY = []
    this.labelsY.push({
      value: 0,
      yCoord: (this.maxBarValue + this.options.paddingTop) * this.unitToPx
    })
    const gridStepInUnit = Math.floor((Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom) / this.options.yAxisSplitNumber)
    let index = gridStepInUnit
    for (let y = this.maxBarValue + this.options.paddingTop - gridStepInUnit; y > 0; y -= gridStepInUnit) {
      this.labelsY.unshift({
        value: index,
        yCoord: y * this.unitToPx
      })
      index += gridStepInUnit
    }
    index = -gridStepInUnit
    for (let y = this.maxBarValue + this.options.paddingTop + gridStepInUnit; y < Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop; y += gridStepInUnit) {
      this.labelsY.push({
        value: index,
        yCoord: y * this.unitToPx
      })
      index -= gridStepInUnit
    }

    for (const labelItem of this.labelsY) {
      const label = document.createElement('div')
      label.classList.add('chart-master__label')
      label.textContent = labelItem.value
      label.style.setProperty('--y', `${labelItem.yCoord}px`)
      this.lablesYElement.append(label)
    }
    this.chartWrapper.append(this.lablesYElement)
  }

  renderLabelsX() {
    if (this.lablesXElement) {
      this.lablesXElement.innerHTML = ''
    } else {
      this.lablesXElement = document.createElement('div')
      this.lablesXElement.classList.add('chart-master__labels')
      this.lablesXElement.classList.add('chart-master__labels--x')
      this.chartWrapper.classList.add('chart-master__wrapper--pb')
    }
    this.labelsX = []
    for (const bar of this.bars) {
      this.labelsX.push({
        label: bar.label,
        xCoord: bar.x + this.options.barWidth / 2
      })
    }
    for (const labelItem of this.labelsX) {
      const label = document.createElement('div')
      label.classList.add('chart-master__label')
      label.textContent = labelItem.label
      label.style.setProperty('--x', `${labelItem.xCoord}px`)
      this.lablesXElement.append(label)
    }
    this.chartWrapper.append(this.lablesXElement)
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    this.hoveredBarIndex = this.options.barBorderRadius === 0 ? this.checkHoverRect(mouseX, mouseY) : this.checkHoverWithCorner(mouseX, mouseY);

    if (this.hoveredBarIndex === undefined) {
      this.backChartState()
    } else {
      if (this.hoveredBarIndex !== this.prevHoveredBarIndex) {
        this.prevHoveredBarIndex = this.hoveredBarIndex

        if (this.options.onBarHover && typeof this.options.onBarHover === 'function') {
          this.options.onBarHover({
            index: this.hoveredBarIndex,
            label: this.bars[this.hoveredBarIndex].label,
            value: this.bars[this.hoveredBarIndex].value
          })
        }

        if (this.options.tooltip) {
          const tooltipData = {
            label: this.bars[this.hoveredBarIndex].label,
            value: this.bars[this.hoveredBarIndex].value
          }
          const ttX = this.bars[this.hoveredBarIndex].x + this.options.barWidth / 2
          const ttY = this.bars[this.hoveredBarIndex].y + this.bars[this.hoveredBarIndex].height / 2
          this.removeTooltip()
          this.renderTooltip(tooltipData, ttX, ttY)
        }

        this.startAnimation()
      }
    }
  }

  checkHoverWithCorner(mouseX, mouseY) {
    const temporaryCanvas = document.createElement('canvas')
    temporaryCanvas.width = this.params.width
    temporaryCanvas.height = this.params.height
    const temporaryContext = temporaryCanvas.getContext('2d')

    for (let index = 0; index < this.bars.length; index++) {
      const bar = this.bars[index]
      const { x, y, width, height } = bar

      temporaryContext.clearRect(0, 0, temporaryCanvas.width, temporaryCanvas.height)

      temporaryContext.beginPath()
      temporaryContext.moveTo(x + this.options.barBorderRadius, y)
      temporaryContext.lineTo(x + width - this.options.barBorderRadius, y)
      temporaryContext.arcTo(x + width, y, x + width, y + this.options.barBorderRadius, this.options.barBorderRadius)
      temporaryContext.lineTo(x + width, y + height - this.options.barBorderRadius)
      temporaryContext.arcTo(x + width, y + height, x + width - this.options.barBorderRadius, y + height, this.options.barBorderRadius)
      temporaryContext.lineTo(x + this.options.barBorderRadius, y + height)
      temporaryContext.arcTo(x, y + height, x, y + height - this.options.barBorderRadius, this.options.barBorderRadius)
      temporaryContext.lineTo(x, y + this.options.barBorderRadius)
      temporaryContext.arcTo(x, y, x + this.options.barBorderRadius, y, this.options.barBorderRadius)
      temporaryContext.closePath()

      if (temporaryContext.isPointInPath(mouseX, mouseY)) {
        return index
      }
    }
  }

  checkHoverRect(mouseX, mouseY) {
    for (const [index, bar] of this.bars.entries()) {
      if (
        mouseX >= bar.x &&
        mouseX <= bar.x + bar.width &&
        mouseY >= bar.y &&
        mouseY <= bar.y + bar.height
      ) return index
    }
  }

  handleMouseLeave() {
    this.backChartState()
  }

  animate() {
    if (this.hoveredBarIndex !== undefined) {
      const currentTime = Date.now()
      const elapsedTime = currentTime - this.animationStartTime
      const progress = Math.min(elapsedTime / this.options.colorTransitionDuration, 1)
      const colorInterpolationCoefficient = this.options.colorTransitionTimingFunction(progress)

      this.hoveredBarColor = this.interpolateColor(
        this.options.barColor,
        this.options.hoverBarColor || this.lightenColor(this.options.barColor, this.options.lightenValue),
        colorInterpolationCoefficient
      )

      this.drawBars()

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this))
      }
    }
  }

  backChartState() {
    this.stopAnimation()
    if (this.options.tooltip) this.removeTooltip()

    if (this.hoveredBarIndex !== undefined) this.hoveredBarColor = this.options.barColor
    this.hoveredBarIndex = undefined
    this.prevHoveredBarIndex = undefined

    this.drawBars()
  }

  localUpdate() {
    this.setBars()
  }
}
BarChart.defaultOptions = {
  gridYColor: '#d4d4d4',
  gridXColor: '#d4d4d4',
  gridYWidth: 1,
  gridXWidth: 1,
  barColor: '#29c5f6',
  barBorderColor: '#000000',
  barBorderWidth: 0,
  barWidth: 50,
  barSpacing: 30,
  barBorderRadius: 0,
  yAxisSplitNumber: 10,
  paddingTop: 2,
  paddingBottom: 2,
  legend: true,
  labelsX: true,
  labelsY: true,
  gridX: true,
  gridY: true,
  iteraction: true,
  lightenValue: 50,
  tooltip: true,
  colorTransitionTimingFunction: function (progress) {
    return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
  },
  colorTransitionDuration: 200
}

class LineChart extends ChartMaster {
  constructor(settings) {
    super(settings.element)

    this.data = settings.data
    this.options = Object.assign({}, LineChart.defaultOptions, settings.options)

    this.cssModificator = 'line'
    this.createLayout()


    this.setMainParameters()
    this.setSize()
    this.mainRender()
    this.setEvents()
  }

  setDots() {
    this.dots = []
    const xInterval = (this.params.width - 2 * this.options.padding) / (this.data.length - 1)
    const yScale = (this.params.height - 2 * this.options.padding) / (Math.max(...this.data) - Math.min(...this.data))
    for (const [index, value] of this.data.entries()) {
      const x = this.options.padding + index * xInterval
      const y = this.params.height - this.options.padding - (value - Math.min(...this.data)) * yScale
      this.dots.push({ x, y, value })
    }
  }

  drawChart() {
    this.drawGrid()
    this.drawAxes()
    if (this.options.line) this.drawGraph()
    if (this.options.dots) this.drawsDots()
  }

  drawAxes() {
    this.ctx.beginPath()

    if (this.options.gridX) {
      this.ctx.lineWidth = this.options.axisXWidth
      this.ctx.strokeStyle = this.options.axisXColor
      // Ось X
      this.ctx.moveTo(this.options.padding, this.params.height - this.options.padding)
      this.ctx.lineTo(this.params.width - this.options.padding, this.params.height - this.options.padding)

      // Метки на оси X
      this.ctx.strokeStyle = this.options.axisXTickColor
      this.ctx.lineWidth = this.options.axisXTickWidth
      const xInterval = (this.params.width - 2 * this.options.padding) / (this.data.length - 1)
      for (let index = 0; index < this.data.length; index++) {
        const x = this.options.padding + index * xInterval
        this.ctx.moveTo(x, this.params.height - this.options.padding - this.options.axisXTickLength / 2)
        this.ctx.lineTo(x, this.params.height - this.options.padding + this.options.axisXTickLength / 2)
      }
    }

    if (this.options.gridY) {
      this.ctx.lineWidth = this.options.axisYWidth
      this.ctx.strokeStyle = this.options.axisYColor
      // Ось Y
      this.ctx.moveTo(this.options.padding, this.options.padding)
      this.ctx.lineTo(this.options.padding, this.params.height - this.options.padding)

      // Метки на оси Y
      const yInterval = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber
      this.ctx.strokeStyle = this.options.axisYTickColor
      this.ctx.lineWidth = this.options.axisYTickWidth
      for (let index = 0; index <= this.options.yAxisSplitNumber; index++) {
        const y = this.params.height - this.options.padding - index * yInterval
        this.ctx.moveTo(this.options.padding - this.options.axisYTickLength / 2, y)
        this.ctx.lineTo(this.options.padding + this.options.axisYTickLength / 2, y)
      }
    }

    this.ctx.stroke()
  }

  drawGrid() {
    this.ctx.beginPath()

    if (this.options.gridY) {
      this.ctx.lineWidth = this.options.gridXWidth
      this.ctx.strokeStyle = this.options.gridXColor
      // Горизонтальные линии сетки
      const yInterval = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber
      for (let index = 0; index <= this.options.yAxisSplitNumber; index++) {
        const y = this.params.height - this.options.padding - index * yInterval
        this.ctx.moveTo(this.options.padding, y)
        this.ctx.lineTo(this.params.width - this.options.padding, y)
      }
    }

    if (this.options.gridX) {
      this.ctx.lineWidth = this.options.gridYWidth
      this.ctx.strokeStyle = this.options.gridYColor
      // Вертикальные линии сетки
      const xInterval = (this.params.width - 2 * this.options.padding) / (this.data.length - 1)
      for (let index = 0; index < this.data.length; index++) {
        const x = this.options.padding + index * xInterval
        this.ctx.moveTo(x, this.options.padding)
        this.ctx.lineTo(x, this.params.height - this.options.padding)
      }
    }

    this.ctx.stroke()
  }

  drawGraph() {
    this.ctx.beginPath()
    this.ctx.strokeStyle = this.options.lineColor
    this.ctx.lineWidth = this.options.lineWidth

    if (this.options.interpolation) {
      this.drawInterpolationLine()
    } else {
      this.drawLine()
    }
  }

  drawLine() {
    for (const [index, dot] of this.dots.entries()) {
      if (index === 0) {
        this.ctx.moveTo(dot.x, dot.y)
      } else {
        this.ctx.lineTo(dot.x, dot.y)
      }
    }

    this.ctx.stroke()
  }

  drawInterpolationLine() {
    // Рисование соединяющей кривой с кубической интерполяцией
    for (let index = 0; index < this.dots.length - 1; index++) {
      const startPoint = this.dots[index]
      const endPoint = this.dots[index + 1]

      // Расчет контрольных точек
      const cp1x = startPoint.x + (endPoint.x - startPoint.x) / 3 * this.options.tensionCoeff
      const cp1y = startPoint.y
      const cp2x = endPoint.x - (endPoint.x - startPoint.x) / 3 * this.options.tensionCoeff
      const cp2y = endPoint.y

      this.ctx.moveTo(startPoint.x, startPoint.y)
      this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endPoint.x, endPoint.y)
    }

    this.ctx.stroke()
  }

  drawsDots() {
    for (const dot of this.dots) {
      this.ctx.fillStyle = this.options.dotColor
      if (this.options.dotBorderWidth) {
        this.ctx.lineWidth = this.options.dotBorderWidth
        this.ctx.strokeStyle = this.options.dotBorderColor
      }
      this.ctx.beginPath()
      this.ctx.arc(dot.x, dot.y, 4, 0, 2 * Math.PI)
      this.ctx.stroke()
      this.ctx.fill()
    }
  }

  renderLabelsY() {
    if (this.lablesYElement) {
      this.lablesYElement.innerHTML = ''
    } else {
      this.lablesYElement = document.createElement('div')
      this.lablesYElement.classList.add('chart-master__labels')
      this.lablesYElement.classList.add('chart-master__labels--y')
      this.chartWrapper.classList.add('chart-master__wrapper--pl')
    }

    this.labelsY = []
    const yInterval = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber
    const maxValue = Math.max(...this.data)
    const minValue = Math.min(...this.data)
    this.ctx.strokeStyle = this.options.axisYTickColor
    this.ctx.lineWidth = this.options.axisYTickWidth
    for (let index = 0; index <= this.options.yAxisSplitNumber; index++) {
      const y = this.params.height - this.options.padding - index * yInterval
      const value = minValue + (maxValue - minValue) * (index / this.options.yAxisSplitNumber)

      this.labelsY.push({
        value,
        yCoord: y
      })
    }

    for (const labelItem of this.labelsY) {
      const label = document.createElement('div')
      label.classList.add('chart-master__label')
      label.textContent = labelItem.value
      label.style.setProperty('--y', `${labelItem.yCoord}px`)
      this.lablesYElement.append(label)
    }
    this.chartWrapper.append(this.lablesYElement)
  }

  renderLabelsX() {
    if (this.lablesXElement) {
      this.lablesXElement.innerHTML = ''
    } else {
      this.lablesXElement = document.createElement('div')
      this.lablesXElement.classList.add('chart-master__labels')
      this.lablesXElement.classList.add('chart-master__labels--x')
      this.chartWrapper.classList.add('chart-master__wrapper--pb')
    }

    this.labelsX = []
    const xInterval = (this.params.width - 2 * this.options.padding) / (this.data.length - 1)
    for (let index = 0; index < this.data.length; index++) {
      const x = this.options.padding + index * xInterval
      this.labelsX.push({
        label: index,
        xCoord: x
      })
    }
    for (const labelItem of this.labelsX) {
      const label = document.createElement('div')
      label.classList.add('chart-master__label')
      label.textContent = labelItem.label
      label.style.setProperty('--x', `${labelItem.xCoord}px`)
      this.lablesXElement.append(label)
    }
    this.chartWrapper.append(this.lablesXElement)
  }

  render() {
    this.setDots()
    this.drawChart()
    if (this.options.labelsX) this.renderLabelsX()
    if (this.options.labelsY) this.renderLabelsY()
  }

  handleMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect()
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top

    for (const [index, dot] of this.dots.entries()) {
      if (
        mouseX >= dot.x - this.options.dotRadius - this.options.iteractionAdditionalRadius &&
        mouseX <= dot.x + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2 &&
        mouseY >= dot.y - this.options.dotRadius - this.options.iteractionAdditionalRadius &&
        mouseY <= dot.y + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2
      ) {
        this.hoveredDotIndex = index
        break
      } else {
        this.hoveredDotIndex = undefined
      }
    }

    if (this.hoveredDotIndex === undefined) {
      this.backChartState()
    } else {
      if (this.hoveredDotIndex !== this.prevHoveredDotIndex) {
        this.prevHoveredDotIndex = this.hoveredDotIndex

        if (this.options.onDotHover && typeof this.options.onDotHover === 'function') {
          this.options.onDotHover({
            index: this.hoveredDotIndex,
            value: this.dots[this.hoveredDotIndex].value
          })
        }

        if (this.options.tooltip) {
          const tooltipData = {
            value: this.dots[this.hoveredDotIndex].value,
            label: this.options.tooltipLabel
          }
          const ttX = this.dots[this.hoveredDotIndex].x
          const ttY = this.dots[this.hoveredDotIndex].y
          this.removeTooltip()
          this.renderTooltip(tooltipData, ttX, ttY)
        }
      }
    }
  }

  backChartState() {
    if (this.options.tooltip) this.removeTooltip()

    this.hoveredDotIndex = undefined
    this.prevHoveredDotIndex = undefined
  }

  handleMouseLeave() {
    this.backChartState()
  }

  localUpdate() {
    this.setDots()
  }
}

LineChart.defaultOptions = {
  padding: 5,
  axisYColor: '#000000',
  axisYTickLength: 5,
  axisYTickWidth: 1,
  axisYTickColor: '#000000',
  axisYWidth: 1,
  axisXColor: '#000000',
  axisXWidth: 1,
  axisXTickLength: 5,
  axisXTickColor: '#000000',
  axisXTickWidth: 1,
  gridYColor: '#e0e0e0',
  gridYWidth: 1,
  gridXColor: '#e0e0e0',
  gridXWidth: 1,
  line: true,
  lineColor: '#ff0000',
  lineWidth: 1,
  interpolation: true,
  tensionCoeff: 1,
  yAxisSplitNumber: 5,
  labelsX: true,
  labelsY: true,
  gridX: true,
  gridY: true,
  tooltip: true,
  dots: false,
  dotColor: '#ffffff',
  dotRadius: 3,
  dotBorderWidth: 2,
  dotBorderColor: '#000000',
  iteraction: true,
  iteractionAdditionalRadius: 4,
  tooltipLabel: '',
  colorTransitionTimingFunction: function (progress) {
    return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
  }
}

export default class PieChart extends ChartMaster {
  constructor(settings) {
    super(settings.element)

    this.data = settings.data
    this.options = Object.assign({}, PieChart.defaultOptions, settings.options)

    this.cssModificator = 'pie'
    this.createLayout()

    this.setMainParameters()
    this.setSize()
    this.setSegments()
    this.setEvents()

    this.mainRender()
  }

  setSegments() {
    let currentAngle = 0

    this.segments = []
    for (const dataItem of this.data) {
      const segmentAngle = (2 * Math.PI * dataItem.value) / this.params.totalValue

      this.segments.push({
        color: dataItem.color,
        hoverColor: dataItem.hoverColor || this.lightenColor(dataItem.color, this.options.lightenValue),
        currentColor: dataItem.color,
        value: dataItem.value,
        label: dataItem.label,
        startAngle: currentAngle,
        endAngle: (currentAngle + segmentAngle)
      })

      currentAngle += segmentAngle
    }
  }

  setParameters() {
    this.params.totalValue = this.data.reduce((sum, dataItem) => sum + dataItem.value, 0)
    this.params.padding = this.options.padding + this.options.borderWidth
    this.params.radius = Math.min(this.params.width, this.params.height) / 2 - this.params.padding

    this.params.centerX = this.params.width / 2
    this.params.centerY = this.params.height / 2
  }

  render() {
    this.drawChart()
    this.drawLegend()
    if (this.options.labels) this.renderLabels()
  }

  drawSegment(startAngle, endAngle, fillColor) {
    this.ctx.beginPath()
    this.ctx.moveTo(this.params.centerX, this.params.centerY)
    this.ctx.arc(this.params.centerX, this.params.centerY, this.params.radius, startAngle, endAngle)
    this.ctx.closePath()
    this.ctx.fillStyle = fillColor
    this.ctx.fill()
    if (this.options.borderWidth > 0) {
      this.ctx.strokeStyle = this.options.borderColor
      this.ctx.lineWidth = this.options.borderWidth
      this.ctx.stroke()
    }
  }

  drawChart() {
    for (const segment of this.segments) {
      this.drawSegment(
        segment.startAngle,
        segment.endAngle,
        segment.currentColor
      )
    }
  }

  handleMouseMove(event) {
    const { offsetX, offsetY } = event
    const dx = offsetX - this.params.centerX
    const dy = offsetY - this.params.centerY
    const distance = Math.sqrt(dx * dx + dy * dy)
    let angle = Math.atan2(dy, dx)
    if (angle < 0) {
      angle += 2 * Math.PI
    }

    const hoverSegmentIndex = this.segments.findIndex(segment => angle > segment.startAngle && angle < segment.endAngle)

    if (hoverSegmentIndex === -1 || distance > this.params.radius) {
      this.backChartState()
    } else {
      if (this.hoverSegment !== hoverSegmentIndex) {
        if (this.options.onSegmentHover && typeof this.options.onSegmentHover === 'function') {
          this.options.onSegmentHover({
            index: hoverSegmentIndex,
            label: this.segments[hoverSegmentIndex].label,
            value: (this.segments[hoverSegmentIndex].value / this.params.totalValue) * 100,
            rawValue: this.segments[hoverSegmentIndex].value
          })
        }
        this.backChartState()

        this.hoverSegment = hoverSegmentIndex
        this.hoveredSegmentColor = this.segments[hoverSegmentIndex].hoverColor

        if (this.options.tooltip) {
          const tooltipData = {
            label: this.segments[hoverSegmentIndex].label,
            value: `${Number.parseFloat(((this.segments[hoverSegmentIndex].value / this.params.totalValue) * 100).toFixed(2))}%`
          }
          const midAngle = (this.segments[hoverSegmentIndex].startAngle + this.segments[hoverSegmentIndex].endAngle) / 2
          const ttX = this.params.centerX + this.params.radius / 2 * Math.cos(midAngle)
          const ttY = this.params.centerY + this.params.radius / 2 * Math.sin(midAngle)
          this.removeTooltip()
          this.renderTooltip(tooltipData, ttX, ttY)
        }

        this.startAnimation()
      }
    }
  }

  handleMouseLeave() {
    this.backChartState()
  }

  backChartState() {
    this.stopAnimation()
    if (this.options.tooltip) this.removeTooltip()

    if (this.hoverSegment !== undefined) this.segments[this.hoverSegment].currentColor = this.segments[this.hoverSegment].color
    this.hoverSegment = undefined

    this.drawChart()
  }

  renderLabels() {
    if (this.lablesElement) {
      this.lablesElement.innerHTML = ''
    } else {
      this.lablesElement = document.createElement('div')
      this.lablesElement.classList.add('chart-master__labels')
    }

    for (const segment of this.segments) {
      const label = document.createElement('div')
      label.classList.add('chart-master__label')

      label.innerHTML = `
      <div class="chart__label-label">${segment.label}</div>
      <div class="chart__label-value">${Number.parseFloat(((segment.value / this.params.totalValue) * 100).toFixed(2))}%</div>
      `

      const midAngle = (segment.startAngle + segment.endAngle) / 2
      const ttX = this.params.centerX + this.params.radius / 2 * Math.cos(midAngle)
      const ttY = this.params.centerY + this.params.radius / 2 * Math.sin(midAngle)
      label.style.setProperty('--angle', `${midAngle * 180 / Math.PI}deg`)
      label.style.setProperty('--center-x', `${ttX}px`)
      label.style.setProperty('--center-y', `${ttY}px`)

      this.lablesElement.append(label)
    }

    this.chartWrapper.append(this.lablesElement)
  }

  animate() {
    if (this.hoverSegment !== undefined) {
      const currentTime = Date.now()
      const elapsedTime = currentTime - this.animationStartTime
      const progress = Math.min(elapsedTime / this.options.colorTransitionDuration, 1)
      const colorInterpolationCoefficient = this.options.colorTransitionTimingFunction(progress)

      this.segments[this.hoverSegment].currentColor = this.interpolateColor(
        this.segments[this.hoverSegment].color,
        this.segments[this.hoverSegment].hoverColor,
        colorInterpolationCoefficient
      )

      this.drawChart()

      if (progress < 1) {
        this.animationFrameId = requestAnimationFrame(this.animate.bind(this))
      }
    }
  }

  localUpdate() {
    this.setSegments()
  }
}

PieChart.defaultOptions = {
  borderWidth: 0,
  borderColor: '#000000',
  padding: 0,
  legend: true,
  lightenValue: 50,
  tooltip: true,
  labels: false,
  iteraction: true,
  colorTransitionTimingFunction: function (progress) {
    return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
  },
  colorTransitionDuration: 200
}

// document.addEventListener('DOMContentLoaded', function () {
//   const pieChart = ChartMaster.createChart('pie', {
//     element: document.querySelector('#chart1'),
//     data: [
//       { label: 'Category A', value: 60, color: '#FF6384' },
//       { label: 'Category B', value: 25, color: '#36A2EB' },
//       { label: 'Category C', value: 65, color: '#FFCE56' },
//       { label: 'Category D', value: 15, color: '#1c781c' }
//     ],
//     options: {
//       borderWidth: 3,
//       borderColor: '#ffffff'
//     }
//   })
//   const barChart = ChartMaster.createChart('bar', {
//     element: document.querySelector('#chart2'),
//     data: [
//       { label: 'Category A', value: 60 },
//       { label: 'Category B', value: 25 },
//       { label: 'Category C', value: -65 },
//       { label: 'Category D', value: 15 }
//     ],
//     options: {}
//   })
//   const lineChart = ChartMaster.createChart('line', {
//     element: document.querySelector('#chart3'),
//     data: [10, 5, 0, 90, 30, -10, 10],
//     options: {}
//   })
//   const polarChart = ChartMaster.createChart('polar', {
//     element: document.querySelector('#chart4'),
//     data: [
//       { label: 'Category A', value: 60, color: 'rgba(255, 99, 132, 0.6)' },
//       { label: 'Category B', value: 25, color: 'rgba(54, 162, 235, 0.6)' },
//       { label: 'Category C', value: 65, color: 'rgba(255, 206, 86, 0.6)' },
//       { label: 'Category D', value: 15, color: 'rgba(28, 120, 28, 0.6)' },
//       { label: 'Category E', value: 45, color: 'rgba(90, 50, 48, 0.6)' }
//     ],
//     options: {}
//   })
//   const radarChart = ChartMaster.createChart('radar', {
//     element: document.querySelector('#chart5'),
//     data: [
//       { label: 'Category A', value: 60 },
//       { label: 'Category B', value: 25 },
//       { label: 'Category C', value: 65 },
//       { label: 'Category D', value: 15 },
//       { label: 'Category E', value: 45 }
//     ]
//   })
// })
