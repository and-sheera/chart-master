class x {
  constructor(i) {
    this.element = i, i.liteChart = this;
  }
  createLayout() {
    this.element.classList.add("lite-chart"), this.element.classList.add(`lite-chart--${this.cssModificator}`), this.chartWrapper = document.createElement("div"), this.chartWrapper.classList = "lite-chart__wrapper", this.canvas = document.createElement("canvas"), this.chartWrapper.append(this.canvas), this.element.append(this.chartWrapper), this.ctx = this.canvas.getContext("2d");
  }
  mainRender() {
    this.ctx.clearRect(0, 0, this.params.width, this.params.height), this.render();
  }
  setMainParameters() {
    this.params = {}, this.params.width = this.canvas.offsetWidth, this.params.height = this.canvas.offsetHeight, this.setParameters && this.setParameters();
  }
  setSize() {
    delete this.canvas.width, delete this.canvas.height, this.canvas.width = this.params.width, this.canvas.height = this.params.height;
  }
  setEvents() {
    this.options.iteraction && (this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this)), this.canvas.addEventListener("mouseleave", this.handleMouseLeave.bind(this))), window.addEventListener("resize", () => {
      this.setMainParameters(), this.setSize(), this.drawChart();
    });
  }
  renderTooltip(i, t, s) {
    this.tooltipElement ? this.tooltipElement.innerHTML = "" : (this.tooltipElement = document.createElement("div"), this.tooltipElement.classList.add("lite-chart__tooltip")), this.tooltipElement.innerHTML = i.label ? `
      <div class="lite-chart__tooltip-label">${i.label}</div>
      <div class="lite-chart__tooltip-value">${i.value}</div>
    ` : `
      <div class="lite-chart__tooltip-value">${i.value}</div>
    `, this.tooltipElement.style.setProperty("--center-x", `${t}px`), this.tooltipElement.style.setProperty("--center-y", `${s}px`), this.chartWrapper.append(this.tooltipElement), this.tooltipElement.classList.add("active");
  }
  removeTooltip() {
    this.tooltipElement && this.tooltipElement.classList.remove("active");
  }
  startAnimation() {
    this.animationStartTime = Date.now(), this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }
  stopAnimation() {
    cancelAnimationFrame(this.animationFrameId);
  }
  interpolateColor(i, t, s) {
    const e = this.hexToRGB(i), a = this.hexToRGB(t), o = e.map((h, r) => {
      const d = (a[r] - h) * s;
      return Math.floor(h + d);
    });
    return this.rgbToHex(o);
  }
  hexToRGB(i) {
    const t = Number.parseInt(i.slice(1, 3), 16), s = Number.parseInt(i.slice(3, 5), 16), e = Number.parseInt(i.slice(5, 7), 16);
    return [t, s, e];
  }
  rgbToHex(i) {
    const [t, s, e] = i, a = t.toString(16).padStart(2, "0"), o = s.toString(16).padStart(2, "0"), h = e.toString(16).padStart(2, "0");
    return `#${a}${o}${h}`;
  }
  lightenColor(i) {
    const s = this.hexToRGB(i).map((e) => Math.min(e + this.options.lightenValue, 255));
    return this.rgbToHex(s);
  }
  update(i, t = {}) {
    this.data = i, this.options = Object.assign({}, this.options, t), this.setMainParameters(), this.localUpdate(), this.mainRender();
  }
}
class p extends x {
  constructor(i) {
    super(i.element), this.data = i.data, this.options = Object.assign({}, p.defaultOptions, i.options), this.cssModificator = "bar", this.createLayout(), this.setMainParameters(), this.setBars(), this.setSize(), this.mainRender(), this.setEvents();
  }
  render() {
    this.drawChart(), this.options.labelsX && this.renderLabelsX(), this.options.labelsY && this.renderLabelsY();
  }
  setParameters() {
    this.maxBarValue = Number.NEGATIVE_INFINITY, this.minBarValue = 0;
    for (const i of this.data)
      i.value > this.maxBarValue && (this.maxBarValue = i.value), i.value < this.minBarValue && (this.minBarValue = i.value);
    this.unitToPx = this.params.height / (Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom);
  }
  setBars() {
    this.bars = [];
    const i = this.data.length * this.options.barWidth + (this.data.length - 1) * this.options.barSpacing;
    let s = (this.params.width - i) / 2;
    for (const e of this.data) {
      const a = Math.abs(e.value) * this.unitToPx, o = e.value > 0 ? (this.maxBarValue + this.options.paddingTop - e.value) * this.unitToPx + 0.5 : (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5;
      this.bars.push({
        value: e.value,
        label: e.label,
        x: s,
        y: o,
        height: a,
        width: this.options.barWidth
      }), s += this.options.barSpacing + this.options.barWidth;
    }
  }
  drawChart() {
    this.drawGrid(), this.drawBars();
  }
  drawGrid() {
    this.options.gridY && this.drawGridY(), this.options.gridX && this.drawGridX();
  }
  drawGridY() {
    const i = Math.floor((Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom) / this.options.yAxisSplitNumber);
    this.ctx.strokeStyle = this.options.gridYColor, this.ctx.lineWidth = this.options.gridYWidth, this.ctx.textAlign = "right", this.ctx.beginPath(), this.ctx.moveTo(0, (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5), this.ctx.lineTo(this.params.width, (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5);
    for (let t = this.maxBarValue + this.options.paddingTop - i; t > 0; t -= i)
      this.ctx.moveTo(0, t * this.unitToPx + 0.5), this.ctx.lineTo(this.params.width, t * this.unitToPx + 0.5);
    for (let t = this.maxBarValue + this.options.paddingTop + i; t < Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop; t += i)
      this.ctx.moveTo(0, t * this.unitToPx + 0.5), this.ctx.lineTo(this.params.width, t * this.unitToPx + 0.5);
    this.ctx.stroke();
  }
  drawGridX() {
    this.ctx.strokeStyle = this.options.gridXColor, this.ctx.lineWidth = this.options.gridYWidth, this.ctx.beginPath();
    const i = this.data.length * this.options.barWidth + (this.data.length - 1) * this.options.barSpacing;
    let s = (this.params.width - i) / 2 - this.options.barSpacing / 2;
    for (let e = 0; e < this.data.length + 1; e++)
      this.ctx.moveTo(s, 0), this.ctx.lineTo(s, this.params.height), s += this.options.barSpacing + this.options.barWidth;
    this.ctx.stroke();
  }
  drawBars() {
    for (const [i, t] of this.bars.entries())
      this.ctx.fillStyle = i === this.hoveredBarIndex ? this.hoveredBarColor : this.options.barColor, this.ctx.fillRect(t.x, t.y, this.options.barWidth, t.height), this.options.barBorderWidth !== 0 && (this.ctx.strokeStyle = this.options.barBorderColor, this.ctx.lineWidth = this.options.barBorderWidth, this.ctx.strokeRect(t.x, t.y, this.options.barWidth, t.height));
  }
  renderLabelsY() {
    this.lablesYElement ? this.lablesYElement.innerHTML = "" : (this.lablesYElement = document.createElement("div"), this.lablesYElement.classList.add("lite-chart__labels"), this.lablesYElement.classList.add("lite-chart__labels--y"), this.chartWrapper.classList.add("lite-chart__wrapper--pl")), this.labelsY = [], this.labelsY.push({
      value: 0,
      yCoord: (this.maxBarValue + this.options.paddingTop) * this.unitToPx
    });
    const i = Math.floor((Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom) / this.options.yAxisSplitNumber);
    let t = i;
    for (let s = this.maxBarValue + this.options.paddingTop - i; s > 0; s -= i)
      this.labelsY.unshift({
        value: t,
        yCoord: s * this.unitToPx
      }), t += i;
    t = -i;
    for (let s = this.maxBarValue + this.options.paddingTop + i; s < Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop; s += i)
      this.labelsY.push({
        value: t,
        yCoord: s * this.unitToPx
      }), t -= i;
    for (const s of this.labelsY) {
      const e = document.createElement("div");
      e.classList.add("lite-chart__label"), e.textContent = s.value, e.style.setProperty("--y", `${s.yCoord}px`), this.lablesYElement.append(e);
    }
    this.chartWrapper.append(this.lablesYElement);
  }
  renderLabelsX() {
    this.lablesXElement ? this.lablesXElement.innerHTML = "" : (this.lablesXElement = document.createElement("div"), this.lablesXElement.classList.add("lite-chart__labels"), this.lablesXElement.classList.add("lite-chart__labels--x"), this.chartWrapper.classList.add("lite-chart__wrapper--pb")), this.labelsX = [];
    for (const i of this.bars)
      this.labelsX.push({
        label: i.label,
        xCoord: i.x + this.options.barWidth / 2
      });
    for (const i of this.labelsX) {
      const t = document.createElement("div");
      t.classList.add("lite-chart__label"), t.textContent = i.label, t.style.setProperty("--x", `${i.xCoord}px`), this.lablesXElement.append(t);
    }
    this.chartWrapper.append(this.lablesXElement);
  }
  handleMouseMove(i) {
    const t = this.canvas.getBoundingClientRect(), s = i.clientX - t.left, e = i.clientY - t.top;
    for (const [a, o] of this.bars.entries())
      if (s >= o.x && s <= o.x + o.width && e >= o.y && e <= o.y + o.height) {
        this.hoveredBarIndex = a;
        break;
      } else
        this.hoveredBarIndex = void 0;
    if (this.hoveredBarIndex === void 0)
      this.backChartState();
    else if (this.hoveredBarIndex !== this.prevHoveredBarIndex) {
      if (this.prevHoveredBarIndex = this.hoveredBarIndex, this.options.onBarHover && typeof this.options.onBarHover == "function" && this.options.onBarHover({
        index: this.hoveredBarIndex,
        label: this.bars[this.hoveredBarIndex].label,
        value: this.bars[this.hoveredBarIndex].value
      }), this.options.tooltip) {
        const a = {
          label: this.bars[this.hoveredBarIndex].label,
          value: this.bars[this.hoveredBarIndex].value
        }, o = this.bars[this.hoveredBarIndex].x + this.options.barWidth / 2, h = this.bars[this.hoveredBarIndex].y + this.bars[this.hoveredBarIndex].height / 2;
        this.removeTooltip(), this.renderTooltip(a, o, h);
      }
      this.startAnimation();
    }
  }
  handleMouseLeave() {
    this.backChartState();
  }
  animate() {
    if (this.hoveredBarIndex !== void 0) {
      const t = Date.now() - this.animationStartTime, s = Math.min(t / this.options.colorTransitionDuration, 1), e = this.options.colorTransitionTimingFunction(s);
      this.hoveredBarColor = this.interpolateColor(this.options.barColor, this.options.hoverBarColor || this.lightenColor(this.options.barColor), e), this.drawBars(), s < 1 && (this.animationFrameId = requestAnimationFrame(this.animate.bind(this)));
    }
  }
  backChartState() {
    this.stopAnimation(), this.options.tooltip && this.removeTooltip(), this.hoveredBarIndex !== void 0 && (this.hoveredBarColor = this.options.barColor), this.hoveredBarIndex = void 0, this.prevHoveredBarIndex = void 0, this.drawBars();
  }
  localUpdate() {
    this.setBars();
  }
}
p.defaultOptions = {
  gridYColor: "#d4d4d4",
  gridXColor: "#d4d4d4",
  gridYWidth: 1,
  gridXWidth: 1,
  barColor: "#29c5f6",
  barBorderColor: "#000000",
  barBorderWidth: 0,
  barWidth: 50,
  barSpacing: 30,
  yAxisSplitNumber: 10,
  paddingTop: 2,
  paddingBottom: 2,
  labelsX: !0,
  labelsY: !0,
  gridX: !0,
  gridY: !0,
  iteraction: !0,
  lightenValue: 50,
  tooltip: !0,
  colorTransitionTimingFunction: function(n) {
    return n < 0.5 ? 2 * n * n : 1 - Math.pow(-2 * n + 2, 2) / 2;
  },
  colorTransitionDuration: 200
  // onBarHover
};
class c extends x {
  constructor(i) {
    super(i.element), this.data = i.data, this.options = Object.assign({}, c.defaultOptions, i.options), this.cssModificator = "line", this.createLayout(), this.setMainParameters(), this.setSize(), this.setDots(), this.mainRender(), this.setEvents();
  }
  setDots() {
    this.dots = [];
    const i = (this.params.width - 2 * this.options.padding) / (this.data.length - 1), t = (this.params.height - 2 * this.options.padding) / (Math.max(...this.data) - Math.min(...this.data));
    for (const [s, e] of this.data.entries()) {
      const a = this.options.padding + s * i, o = this.params.height - this.options.padding - (e - Math.min(...this.data)) * t;
      this.dots.push({
        x: a,
        y: o,
        value: e
      });
    }
  }
  drawChart() {
    this.drawGrid(), this.drawAxes(), this.options.line && this.drawGraph(), this.options.dots && this.drawsDots();
  }
  drawAxes() {
    if (this.ctx.beginPath(), this.options.gridX) {
      this.ctx.lineWidth = this.options.axisXWidth, this.ctx.strokeStyle = this.options.axisXColor, this.ctx.moveTo(this.options.padding, this.params.height - this.options.padding), this.ctx.lineTo(this.params.width - this.options.padding, this.params.height - this.options.padding), this.ctx.strokeStyle = this.options.axisXTickColor, this.ctx.lineWidth = this.options.axisXTickWidth;
      const i = (this.params.width - 2 * this.options.padding) / (this.data.length - 1);
      for (let t = 0; t < this.data.length; t++) {
        const s = this.options.padding + t * i;
        this.ctx.moveTo(s, this.params.height - this.options.padding - this.options.axisXTickLength / 2), this.ctx.lineTo(s, this.params.height - this.options.padding + this.options.axisXTickLength / 2), this.ctx.fillText(t.toString(), s - 4, this.params.height - this.options.padding + 20);
      }
    }
    if (this.options.gridY) {
      this.ctx.lineWidth = this.options.axisYWidth, this.ctx.strokeStyle = this.options.axisYColor, this.ctx.moveTo(this.options.padding, this.options.padding), this.ctx.lineTo(this.options.padding, this.params.height - this.options.padding);
      const i = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber;
      this.ctx.strokeStyle = this.options.axisYTickColor, this.ctx.lineWidth = this.options.axisYTickWidth;
      for (let t = 0; t <= this.options.yAxisSplitNumber; t++) {
        const s = this.params.height - this.options.padding - t * i;
        this.ctx.moveTo(this.options.padding - this.options.axisYTickLength / 2, s), this.ctx.lineTo(this.options.padding + this.options.axisYTickLength / 2, s);
      }
    }
    this.ctx.stroke();
  }
  drawGrid() {
    if (this.ctx.beginPath(), this.options.gridY) {
      this.ctx.lineWidth = this.options.gridXWidth, this.ctx.strokeStyle = this.options.gridXColor;
      const i = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber;
      for (let t = 0; t <= this.options.yAxisSplitNumber; t++) {
        const s = this.params.height - this.options.padding - t * i;
        this.ctx.moveTo(this.options.padding, s), this.ctx.lineTo(this.params.width - this.options.padding, s);
      }
    }
    if (this.options.gridX) {
      this.ctx.lineWidth = this.options.gridYWidth, this.ctx.strokeStyle = this.options.gridYColor;
      const i = (this.params.width - 2 * this.options.padding) / (this.data.length - 1);
      for (let t = 0; t < this.data.length; t++) {
        const s = this.options.padding + t * i;
        this.ctx.moveTo(s, this.options.padding), this.ctx.lineTo(s, this.params.height - this.options.padding);
      }
    }
    this.ctx.stroke();
  }
  drawGraph() {
    this.ctx.beginPath(), this.ctx.strokeStyle = this.options.lineColor, this.ctx.lineWidth = this.options.lineWidth, this.options.interpolation ? this.drawInterpolationLine() : this.drawLine();
  }
  drawLine() {
    for (const [i, t] of this.dots.entries())
      i === 0 ? this.ctx.moveTo(t.x, t.y) : this.ctx.lineTo(t.x, t.y);
    this.ctx.stroke();
  }
  drawInterpolationLine() {
    for (let i = 0; i < this.dots.length - 1; i++) {
      const t = this.dots[i], s = this.dots[i + 1], e = t.x + (s.x - t.x) / 3 * this.options.tensionCoeff, a = t.y, o = s.x - (s.x - t.x) / 3 * this.options.tensionCoeff, h = s.y;
      this.ctx.moveTo(t.x, t.y), this.ctx.bezierCurveTo(e, a, o, h, s.x, s.y);
    }
    this.ctx.stroke();
  }
  drawsDots() {
    for (const i of this.dots)
      this.ctx.fillStyle = this.options.dotColor, this.options.dotBorderWidth && (this.ctx.lineWidth = this.options.dotBorderWidth, this.ctx.strokeStyle = this.options.dotBorderColor), this.ctx.beginPath(), this.ctx.arc(i.x, i.y, 4, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.fill();
  }
  calculatePoints() {
    const i = this.data.length, t = (this.params.width - this.options.padding * 2) / (i - 1), s = Math.max(...this.data) - Math.min(...this.data), e = (this.params.height - this.options.padding * 2) / s;
    return this.data.map((a, o) => ({
      x: this.options.padding + o * t,
      y: this.params.height - this.options.padding - (a - Math.min(...this.data)) * e
    }));
  }
  renderLabelsY() {
    this.lablesYElement ? this.lablesYElement.innerHTML = "" : (this.lablesYElement = document.createElement("div"), this.lablesYElement.classList.add("lite-chart__labels"), this.lablesYElement.classList.add("lite-chart__labels--y"), this.chartWrapper.classList.add("lite-chart__wrapper--pl")), this.labelsY = [];
    const i = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber, t = Math.max(...this.data), s = Math.min(...this.data);
    this.ctx.strokeStyle = this.options.axisYTickColor, this.ctx.lineWidth = this.options.axisYTickWidth;
    for (let e = 0; e <= this.options.yAxisSplitNumber; e++) {
      const a = this.params.height - this.options.padding - e * i, o = s + (t - s) * (e / this.options.yAxisSplitNumber);
      this.labelsY.push({
        value: o,
        yCoord: a
      });
    }
    for (const e of this.labelsY) {
      const a = document.createElement("div");
      a.classList.add("lite-chart__label"), a.textContent = e.value, a.style.setProperty("--y", `${e.yCoord}px`), this.lablesYElement.append(a);
    }
    this.chartWrapper.append(this.lablesYElement);
  }
  renderLabelsX() {
    this.lablesXElement ? this.lablesXElement.innerHTML = "" : (this.lablesXElement = document.createElement("div"), this.lablesXElement.classList.add("lite-chart__labels"), this.lablesXElement.classList.add("lite-chart__labels--x"), this.chartWrapper.classList.add("lite-chart__wrapper--pb")), this.labelsX = [];
    const i = (this.params.width - 2 * this.options.padding) / (this.data.length - 1);
    for (let t = 0; t < this.data.length; t++) {
      const s = this.options.padding + t * i;
      this.labelsX.push({
        label: t,
        xCoord: s
      });
    }
    for (const t of this.labelsX) {
      const s = document.createElement("div");
      s.classList.add("lite-chart__label"), s.textContent = t.label, s.style.setProperty("--x", `${t.xCoord}px`), this.lablesXElement.append(s);
    }
    this.chartWrapper.append(this.lablesXElement);
  }
  render() {
    this.drawChart(), this.options.labelsX && this.renderLabelsX(), this.options.labelsY && this.renderLabelsY();
  }
  handleMouseMove(i) {
    const t = this.canvas.getBoundingClientRect(), s = i.clientX - t.left, e = i.clientY - t.top;
    for (const [a, o] of this.dots.entries())
      if (s >= o.x - this.options.dotRadius - this.options.iteractionAdditionalRadius && s <= o.x + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2 && e >= o.y - this.options.dotRadius - this.options.iteractionAdditionalRadius && e <= o.y + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2) {
        this.hoveredDotIndex = a;
        break;
      } else
        this.hoveredDotIndex = void 0;
    if (this.hoveredDotIndex === void 0)
      this.backChartState();
    else if (this.hoveredDotIndex !== this.prevHoveredDotIndex && (this.prevHoveredDotIndex = this.hoveredDotIndex, this.options.onDotHover && typeof this.options.onDotHover == "function" && this.options.onDotHover({
      index: this.hoveredDotIndex,
      value: this.dots[this.hoveredDotIndex].value
    }), this.options.tooltip)) {
      const a = {
        value: this.dots[this.hoveredDotIndex].value,
        label: this.options.tooltipLabel
      }, o = this.dots[this.hoveredDotIndex].x, h = this.dots[this.hoveredDotIndex].y;
      this.removeTooltip(), this.renderTooltip(a, o, h);
    }
  }
  backChartState() {
    this.options.tooltip && this.removeTooltip(), this.hoveredDotIndex = void 0, this.prevHoveredDotIndex = void 0;
  }
  handleMouseLeave() {
    this.backChartState();
  }
  localUpdate() {
    this.setDots();
  }
}
c.defaultOptions = {
  padding: 5,
  axisYColor: "#000000",
  axisYTickLength: 5,
  axisYTickWidth: 1,
  axisYTickColor: "#000000",
  axisYWidth: 1,
  axisXColor: "#000000",
  axisXWidth: 1,
  axisXTickLength: 5,
  axisXTickColor: "#000000",
  axisXTickWidth: 1,
  gridYColor: "#e0e0e0",
  gridYWidth: 1,
  gridXColor: "#e0e0e0",
  gridXWidth: 1,
  line: !0,
  lineColor: "#ff0000",
  lineWidth: 1,
  interpolation: !0,
  tensionCoeff: 1,
  yAxisSplitNumber: 5,
  labelsX: !0,
  labelsY: !0,
  gridX: !0,
  gridY: !0,
  lightenValue: 50,
  tooltip: !0,
  dots: !1,
  dotColor: "#ffffff",
  dotRadius: 3,
  dotBorderWidth: 2,
  dotBorderColor: "#000000",
  iteraction: !0,
  iteractionAdditionalRadius: 4,
  tooltipLabel: "",
  colorTransitionTimingFunction: function(n) {
    return n < 0.5 ? 2 * n * n : 1 - Math.pow(-2 * n + 2, 2) / 2;
  }
};
class m extends x {
  constructor(i) {
    super(i.element), this.data = i.data, this.options = Object.assign({}, m.defaultOptions, i.options), this.cssModificator = "pie", this.createLayout(), this.setMainParameters(), this.setSize(), this.setSegments(), this.setEvents(), this.mainRender();
  }
  setSegments() {
    let i = 0;
    this.segments = [];
    for (const t of this.data) {
      const s = 2 * Math.PI * t.value / this.params.totalValue;
      this.segments.push({
        color: t.color,
        hoverColor: t.hoverColor || this.lightenColor(t.color),
        currentColor: t.color,
        value: t.value,
        label: t.label,
        startAngle: i,
        endAngle: i + s
      }), i += s;
    }
  }
  setParameters() {
    this.params.totalValue = this.data.reduce((i, t) => i + t.value, 0), this.params.padding = this.options.padding + this.options.borderWidth, this.params.radius = Math.min(this.params.width, this.params.height) / 2 - this.params.padding, this.params.centerX = this.params.width / 2, this.params.centerY = this.params.height / 2;
  }
  render() {
    this.drawChart(), this.drawLegend(), this.options.labels && this.renderLabels();
  }
  drawSegment(i, t, s) {
    this.ctx.beginPath(), this.ctx.moveTo(this.params.centerX, this.params.centerY), this.ctx.arc(this.params.centerX, this.params.centerY, this.params.radius, i, t), this.ctx.closePath(), this.ctx.fillStyle = s, this.ctx.fill(), this.options.borderWidth > 0 && (this.ctx.strokeStyle = this.options.borderColor, this.ctx.lineWidth = this.options.borderWidth, this.ctx.stroke());
  }
  drawChart() {
    for (const i of this.segments)
      this.drawSegment(i.startAngle, i.endAngle, i.currentColor);
  }
  drawLegend() {
    if (!this.options.legend)
      return;
    this.legendElement || (this.legendElement = document.createElement("div"), this.legendElement.classList.add("lite-chart__legend"), this.element.append(this.legendElement)), this.legendElement.innerHTML = "";
    const i = document.createElement("ul");
    i.classList.add("lite-chart__legend-list"), this.legendElement.append(i);
    for (const t of this.data) {
      const s = document.createElement("li");
      s.classList.add("lite-chart__legend-item"), i.append(s);
      const e = document.createElement("span");
      e.classList.add("lite-chart__legend-color"), e.style.backgroundColor = t.color, s.append(e);
      const a = document.createElement("span");
      a.classList.add("lite-chart__legend-label"), a.textContent = t.label, s.append(a);
      const o = document.createElement("span");
      o.classList.add("lite-chart__legend-value"), o.textContent = `${Number.parseFloat((t.value / this.params.totalValue * 100).toFixed(2))}%`, s.append(o);
    }
  }
  handleMouseMove(i) {
    const {
      offsetX: t,
      offsetY: s
    } = i, e = t - this.params.centerX, a = s - this.params.centerY, o = Math.sqrt(e * e + a * a);
    let h = Math.atan2(a, e);
    h < 0 && (h += 2 * Math.PI);
    const r = this.segments.findIndex((l) => h > l.startAngle && h < l.endAngle);
    if (r === -1 || o > this.params.radius)
      this.backChartState();
    else if (this.hoverSegment !== r) {
      if (this.options.onSegmentHover && typeof this.options.onSegmentHover == "function" && this.options.onSegmentHover({
        index: r,
        label: this.segments[r].label,
        value: this.segments[r].value / this.params.totalValue * 100,
        rawValue: this.segments[r].value
      }), this.backChartState(), this.hoverSegment = r, this.hoveredSegmentColor = this.segments[r].hoverColor, this.options.tooltip) {
        const l = {
          label: this.segments[r].label,
          value: `${Number.parseFloat((this.segments[r].value / this.params.totalValue * 100).toFixed(2))}%`
        }, d = (this.segments[r].startAngle + this.segments[r].endAngle) / 2, u = this.params.centerX + this.params.radius / 2 * Math.cos(d), g = this.params.centerY + this.params.radius / 2 * Math.sin(d);
        this.removeTooltip(), this.renderTooltip(l, u, g);
      }
      this.startAnimation();
    }
  }
  handleMouseLeave() {
    this.backChartState();
  }
  backChartState() {
    this.stopAnimation(), this.options.tooltip && this.removeTooltip(), this.hoverSegment !== void 0 && (this.segments[this.hoverSegment].currentColor = this.segments[this.hoverSegment].color), this.hoverSegment = void 0, this.drawChart();
  }
  renderLabels() {
    this.lablesElement ? this.lablesElement.innerHTML = "" : (this.lablesElement = document.createElement("div"), this.lablesElement.classList.add("lite-chart__labels"));
    for (const i of this.segments) {
      const t = document.createElement("div");
      t.classList.add("lite-chart__label"), t.innerHTML = `
      <div class="chart__label-label">${i.label}</div>
      <div class="chart__label-value">${Number.parseFloat((i.value / this.params.totalValue * 100).toFixed(2))}%</div>
      `;
      const s = (i.startAngle + i.endAngle) / 2, e = this.params.centerX + this.params.radius / 2 * Math.cos(s), a = this.params.centerY + this.params.radius / 2 * Math.sin(s);
      t.style.setProperty("--angle", `${s * 180 / Math.PI}deg`), t.style.setProperty("--center-x", `${e}px`), t.style.setProperty("--center-y", `${a}px`), this.lablesElement.append(t);
    }
    this.chartWrapper.append(this.lablesElement);
  }
  animate() {
    if (this.hoverSegment !== void 0) {
      const t = Date.now() - this.animationStartTime, s = Math.min(t / this.options.colorTransitionDuration, 1), e = this.options.colorTransitionTimingFunction(s);
      this.segments[this.hoverSegment].currentColor = this.interpolateColor(this.segments[this.hoverSegment].color, this.segments[this.hoverSegment].hoverColor, e), this.drawChart(), s < 1 && (this.animationFrameId = requestAnimationFrame(this.animate.bind(this)));
    }
  }
  localUpdate() {
    this.setSegments();
  }
}
m.defaultOptions = {
  borderWidth: 0,
  borderColor: "#000000",
  padding: 0,
  legend: !0,
  lightenValue: 50,
  tooltip: !0,
  labels: !1,
  iteraction: !0,
  colorTransitionTimingFunction: function(n) {
    return n < 0.5 ? 2 * n * n : 1 - Math.pow(-2 * n + 2, 2) / 2;
  },
  colorTransitionDuration: 200
  // onSegmentHover
};
class b {
  constructor(i, t) {
    switch (i) {
      case "pie": {
        new m(t);
        break;
      }
      case "bar": {
        new p(t);
        break;
      }
      case "line": {
        new c(t);
        break;
      }
    }
  }
}
export {
  b as LiteChart
};
