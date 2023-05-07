import { Chart } from './chart'

export default class LineChart extends Chart {
  constructor(settings) {
    super(settings.element)

    this.data = settings.data
    this.options = Object.assign({}, LineChart.defaultOptions, settings.options)

    this.cssModificator = 'line'
    this.createLayout()


    this.setMainParameters()
    this.setSize()
    this.setDots()
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
        this.ctx.fillText(index.toString(), x - 4, this.params.height - this.options.padding + 20)
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

  calculatePoints() {
    const dataLength = this.data.length
    const xStep = (this.params.width - this.options.padding * 2) / (dataLength - 1)
    const yRange = Math.max(...this.data) - Math.min(...this.data)
    const yStep = (this.params.height - this.options.padding * 2) / yRange

    return this.data.map((value, index) => ({
      x: this.options.padding + index * xStep,
      y: this.params.height - this.options.padding - (value - Math.min(...this.data)) * yStep
    }))
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
  lightenValue: 50,
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
