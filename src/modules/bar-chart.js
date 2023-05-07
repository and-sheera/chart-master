import { Chart } from './chart'

export default class BarChart extends Chart {
  constructor(settings) {
    super(settings.element)
    this.data = settings.data
    this.options = Object.assign({}, BarChart.defaultOptions, settings.options)
    this.cssModificator = 'bar'
    this.createLayout()
    this.setMainParameters()
    this.setBars()
    this.setSize()
    this.mainRender()
    this.setEvents()
  }

  render() {
    this.drawChart()
    if (this.options.labelsX) this.renderLabelsX()
    if (this.options.labelsY) this.renderLabelsY()
  }

  setParameters() {
    this.maxBarValue = Number.NEGATIVE_INFINITY
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
      this.ctx.fillRect(bar.x, bar.y, this.options.barWidth, bar.height)
      if (this.options.barBorderWidth !== 0) {
        this.ctx.strokeStyle = this.options.barBorderColor
        this.ctx.lineWidth = this.options.barBorderWidth
        this.ctx.strokeRect(bar.x, bar.y, this.options.barWidth, bar.height)
      }
    }
  }

  renderLabelsY() {
    if (this.lablesYElement) {
      this.lablesYElement.innerHTML = ''
    } else {
      this.lablesYElement = document.createElement('div')
      this.lablesYElement.classList.add('lite-chart__labels')
      this.lablesYElement.classList.add('lite-chart__labels--y')
      this.chartWrapper.classList.add('lite-chart__wrapper--pl')
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
      label.classList.add('lite-chart__label')
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
      this.lablesXElement.classList.add('lite-chart__labels')
      this.lablesXElement.classList.add('lite-chart__labels--x')
      this.chartWrapper.classList.add('lite-chart__wrapper--pb')
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
      label.classList.add('lite-chart__label')
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

    for (const [index, bar] of this.bars.entries()) {
      if (
        mouseX >= bar.x &&
        mouseX <= bar.x + bar.width &&
        mouseY >= bar.y &&
        mouseY <= bar.y + bar.height
      ) {
        this.hoveredBarIndex = index
        break
      } else {
        this.hoveredBarIndex = undefined
      }
    }

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
        this.options.hoverBarColor || this.lightenColor(this.options.barColor),
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
  yAxisSplitNumber: 10,
  paddingTop: 2,
  paddingBottom: 2,
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
  // onBarHover
}
