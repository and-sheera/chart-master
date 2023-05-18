describe('hex to rbg', () => {
  it('should translate hex color to rgba correctly', () => {
    const rgba = hexToRGBA('#966257')
    expect(rgba).toEqual([150, 98, 87, 1])
  })
  it('should translate hex color to rgba correctly', () => {
    const rgba = hexToRGBA('#fe5000')
    expect(rgba).toEqual([254, 80, 0, 1])
  })
})

describe('interpolateColor', () => {
  it('should interpolate colors correctly', () => {
    const startColor = '#FF0000'
    const endColor = '#7B0A67'
    const coefficient = 0.5
    const interpolatedColor = interpolateColor(startColor, endColor, coefficient)
    expect(interpolatedColor).toBe('rgba(189, 5, 52, 1)')
  })
  it('should interpolate colors correctly', () => {
    const startColor = 'rgb(57, 105, 105)'
    const endColor = 'rgb(243, 91, 68)'
    const coefficient = 0
    const interpolatedColor = interpolateColor(startColor, endColor, coefficient)
    expect(interpolatedColor).toBe('rgba(57, 105, 105, 1)')
  })
})

describe('pie chart setting segments', () => {
  it('last element should equal to 360deg in rads', () => {
    const segments = setSegments(pieChartData)
    expect(segments[segments.length - 1].endAngle).toBe(2 * Math.PI)
  })
})

describe('bar chart setting bars', () => {
  it('the sum of the heights of the maximum and minimum columns must be equal to the height of the canvas', () => {
    const height = 350
    const bars = setBars(barChartData, height)
    expect(bars[0].height + bars[2].height).toBe(height)
  })
})

describe('line chart setting bars', () => {
  it('the maximum point should be at the very top, and the minimum point at the very bottom of the canvas.', () => {
    const height = 350
    const dots = setDots(lineChartData, height)
    expect(dots[5].y).toBe(height)
    expect(dots[3].y).toBe(0)
  })
})

function interpolateColor(startColor, endColor, coefficient) {
  const startValues = colorToRGBA(startColor)
  const endValues = colorToRGBA(endColor)

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

function lightenColor(color, lightenValue) {
  const rgbaValues = colorToRGBA(color)

  const lightenRGBA = rgbaValues.map((value, index) => {
    if (index < 3) {
      const newValue = Math.min(value + lightenValue, 255)
      return Math.round(newValue)
    }
    return value
  })
  return `rgba(${lightenRGBA.join(', ')})`
}

function colorToRGBA(color) {
  if (color.startsWith('#')) {
    return hexToRGBA(color)
  } else if (color.startsWith('rgba')) {
    return rgbaToRGBA(color)
  } else if (color.startsWith('rgb')) {
    return rgbToRGBA(color)
  }
}

function hexToRGBA(hexColor) {
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)

  return [r, g, b, 1]
}

function rgbToRGBA(rgbColor) {
  const values = rgbColor.substring(4, rgbColor.length - 1).split(',').map(Number)

  return [...values, 1]
}

function rgbaToRGBA(rgbaColor) {
  return rgbaColor.substring(5, rgbaColor.length - 1).split(',').map(Number)
}

const pieChartData = [
  { label: 'Category A', value: 60, color: '#FF6384' },
  { label: 'Category B', value: 25, color: '#36A2EB' },
  { label: 'Category C', value: 65, color: '#FFCE56' },
  { label: 'Category D', value: 15, color: '#1c781c' }
]

const barChartData = [
  { label: 'Category A', value: 60 },
  { label: 'Category B', value: 25 },
  { label: 'Category C', value: -65 },
  { label: 'Category D', value: 15 }
]

function setSegments(data) {
  let currentAngle = 0

  const totalValue = data.reduce((sum, dataItem) => sum + dataItem.value, 0)
  const segments = []
  for (const dataItem of data) {
    const segmentAngle = (2 * Math.PI * dataItem.value) / totalValue

    segments.push({
      startAngle: currentAngle,
      endAngle: (currentAngle + segmentAngle)
    })

    currentAngle += segmentAngle
  }
  return segments
}

function setBars(data, canvasHeight) {
  let maxBarValue = 0
  let minBarValue = 0
  for (const dataItem of data) {
    if (dataItem.value > maxBarValue) {
      maxBarValue = dataItem.value
    }
    if (dataItem.value < minBarValue) {
      minBarValue = dataItem.value
    }
  }
  const unitToPx = canvasHeight / (Math.abs(minBarValue) + maxBarValue)
  const bars = []
  for (const dataItem of data) {
    const barHeight = Math.abs(dataItem.value) * unitToPx
    bars.push({
      height: barHeight
    })
  }
  return bars
}

const lineChartData = [10, 5, 0, 90, 30, -10, 10]

function setDots(data, height) {
  const dots = []
  const yScale = height / (Math.max(...data) - Math.min(...data))
  for (const [index, value] of data.entries()) {
    const y = height - (value - Math.min(...data)) * yScale
    dots.push({ y })
  }
  return dots
}
