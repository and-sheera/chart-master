import { Chart } from './chart'

export default class PieChart extends Chart {
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
        hoverColor: dataItem.hoverColor || this.lightenColor(dataItem.color),
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

  drawLegend() {
    if (!this.options.legend) return

    if (!this.legendElement) {
      this.legendElement = document.createElement('div')
      this.legendElement.classList.add('lite-chart__legend')
      this.element.append(this.legendElement)
    }

    this.legendElement.innerHTML = ''

    const legendList = document.createElement('ul')
    legendList.classList.add('lite-chart__legend-list')
    this.legendElement.append(legendList)

    for (const slice of this.data) {
      const legendItem = document.createElement('li')
      legendItem.classList.add('lite-chart__legend-item')
      legendList.append(legendItem)

      const colorBox = document.createElement('span')
      colorBox.classList.add('lite-chart__legend-color')
      colorBox.style.backgroundColor = slice.color
      legendItem.append(colorBox)

      const label = document.createElement('span')
      label.classList.add('lite-chart__legend-label')
      label.textContent = slice.label
      legendItem.append(label)

      const value = document.createElement('span')
      value.classList.add('lite-chart__legend-value')
      value.textContent = `${Number.parseFloat(((slice.value / this.params.totalValue) * 100).toFixed(2))}%`
      legendItem.append(value)
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
      this.lablesElement.classList.add('lite-chart__labels')
    }

    for (const segment of this.segments) {
      const label = document.createElement('div')
      label.classList.add('lite-chart__label')

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
  // onSegmentHover
}
