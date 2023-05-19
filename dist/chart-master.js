class x {
  constructor(t) {
    t && (this.element = t, t.chartMaster = this);
  }
  static createChart(t, s) {
    switch (t) {
      case "pie": {
        new y(s);
        break;
      }
      case "bar": {
        new f(s);
        break;
      }
      case "line": {
        new T(s);
        break;
      }
      case "polar": {
        new v(s);
        break;
      }
      case "radar":
        return new g(s);
      default:
        console.error("This chart type was not found");
    }
  }
  createLayout() {
    this.element.classList.add("chart-master"), this.element.classList.add(`chart-master--${this.cssModificator}`), this.chartWrapper = document.createElement("div"), this.chartWrapper.classList = "chart-master__wrapper", this.canvas = document.createElement("canvas"), this.chartWrapper.append(this.canvas), this.element.append(this.chartWrapper), this.ctx = this.canvas.getContext("2d");
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
      this.setMainParameters(), this.setSize(), this.mainRender();
    });
  }
  renderTooltip(t, s, i) {
    this.tooltipElement ? this.tooltipElement.innerHTML = "" : (this.tooltipElement = document.createElement("div"), this.tooltipElement.classList.add("chart-master__tooltip")), this.tooltipElement.innerHTML = t.label ? `
      <div class="chart-master__tooltip-label">${t.label}</div>
      <div class="chart-master__tooltip-value">${t.value}</div>
    ` : `
      <div class="chart-master__tooltip-value">${t.value}</div>
    `, this.tooltipElement.style.setProperty("--center-x", `${s}px`), this.tooltipElement.style.setProperty("--center-y", `${i}px`), this.chartWrapper.append(this.tooltipElement), this.tooltipElement.classList.add("active");
  }
  removeTooltip() {
    this.tooltipElement && this.tooltipElement.classList.remove("active");
  }
  drawLegend() {
    if (!this.options.legend)
      return;
    this.legendElement || (this.legendElement = document.createElement("div"), this.legendElement.classList.add("chart-master__legend"), this.element.append(this.legendElement)), this.legendElement.innerHTML = "";
    const t = document.createElement("ul");
    t.classList.add("chart-master__legend-list"), this.legendElement.append(t);
    for (const s of this.data) {
      const i = document.createElement("li");
      if (i.classList.add("chart-master__legend-item"), t.append(i), s.color) {
        const a = document.createElement("span");
        a.classList.add("chart-master__legend-color"), a.style.backgroundColor = s.color, i.append(a);
      }
      const e = document.createElement("span");
      e.classList.add("chart-master__legend-label"), e.textContent = s.label, i.append(e);
      const o = document.createElement("span");
      o.classList.add("chart-master__legend-value"), o.textContent = this.params.totalValue === void 0 ? `${Number.parseFloat(s.value.toFixed(2))}` : `${Number.parseFloat((s.value / this.params.totalValue * 100).toFixed(2))}%`, i.append(o);
    }
  }
  startAnimation() {
    this.animationStartTime = Date.now(), this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }
  stopAnimation() {
    cancelAnimationFrame(this.animationFrameId);
  }
  interpolateColor(t, s, i) {
    const e = this.colorToRGBA(t), o = this.colorToRGBA(s);
    return `rgba(${e.map((r, n) => {
      if (n < 3) {
        const d = (o[n] - r) * i;
        return Math.round(r + d);
      }
      return r;
    }).join(", ")})`;
  }
  lightenColor(t, s) {
    return `rgba(${this.colorToRGBA(t).map((o, a) => {
      if (a < 3) {
        const r = Math.min(o + s, 255);
        return Math.round(r);
      }
      return o;
    }).join(", ")})`;
  }
  colorToRGBA(t) {
    if (t.startsWith("#"))
      return this.hexToRGBA(t);
    if (t.startsWith("rgba"))
      return this.rgbaToRGBA(t);
    if (t.startsWith("rgb"))
      return this.rgbToRGBA(t);
  }
  hexToRGBA(t) {
    const s = Number.parseInt(t.slice(1, 3), 16), i = Number.parseInt(t.slice(3, 5), 16), e = Number.parseInt(t.slice(5, 7), 16);
    return [s, i, e, 1];
  }
  rgbToRGBA(t) {
    return [...t.substring(4, t.length - 1).split(",").map(Number), 1];
  }
  rgbaToRGBA(t) {
    return t.substring(5, t.length - 1).split(",").map(Number);
  }
  update(t, s = {}) {
    this.data = t, this.options = Object.assign({}, this.options, s), this.setMainParameters(), this.localUpdate(), this.mainRender();
  }
}
class g extends x {
  constructor(t) {
    super(t.element), this.data = t.data, this.options = Object.assign({}, g.defaultOptions, t.options), this.cssModificator = "radar", this.createLayout(), this.setMainParameters(), this.setSize(), this.setDots(), this.setEvents(), this.mainRender();
  }
  setParameters() {
    this.params.centerX = this.params.width / 2, this.params.centerY = this.params.height / 2, this.params.radius = Math.min(this.params.width, this.params.height) / 2;
  }
  setDots() {
    this.dots = [];
    const t = Math.max(...this.data.map((e) => e.value));
    let s = (90 - 360 / this.data.length / 2) * Math.PI / 180;
    const i = 2 * Math.PI / this.data.length;
    for (const [e, o] of this.data.entries()) {
      const a = o.value / t * this.params.radius, r = this.params.centerX + a * Math.cos(s), n = this.params.centerY + a * Math.sin(s);
      s += i, this.dots.push({
        x: r,
        y: n,
        value: o.value
      });
    }
  }
  render() {
    this.drawChart(), this.options.labels && this.renderLabels(), this.options.dots && this.drawsDots();
  }
  drawChart() {
    const {
      canvas: t,
      ctx: s,
      data: i,
      options: e,
      params: o,
      dots: a
    } = this, r = t.width / 2, n = t.height / 2, l = (90 - 360 / i.length / 2) * Math.PI / 180, d = 2 * Math.PI / i.length;
    s.strokeStyle = e.axesColor, s.lineWidth = e.axesLineWidth;
    let c = l;
    for (let m = 0; m < i.length; m++) {
      const p = r + o.radius * Math.cos(c), b = n + o.radius * Math.sin(c);
      s.beginPath(), s.moveTo(r, n), s.lineTo(p, b), s.closePath(), s.stroke(), c += d;
    }
    const u = Math.max(...i.map((m) => m.value));
    s.strokeStyle = "#676767", s.lineWidth = 1, s.beginPath();
    for (let m = 0; m < e.splitSections; m++) {
      const p = u / (e.splitSections - 1) * m / u * o.radius;
      c = l;
      for (const [b, M] of i.entries()) {
        const C = r + p * Math.cos(c), S = n + p * Math.sin(c);
        b === 0 ? s.moveTo(C, S) : (s.lineTo(C, S), b === i.length - 1 && s.lineTo(r + p * Math.cos(l), n + p * Math.sin(l))), c += d;
      }
    }
    s.closePath(), s.stroke(), s.strokeStyle = e.gridColor, s.lineWidth = e.gridLineWidth, s.beginPath();
    for (const [m, p] of a.entries())
      m === 0 ? s.moveTo(p.x, p.y) : s.lineTo(p.x, p.y);
    s.closePath(), s.stroke(), s.fillStyle = e.bgSectionColor, s.fill();
  }
  renderLabels() {
    this.lablesElement ? this.lablesElement.innerHTML = "" : (this.lablesElement = document.createElement("div"), this.lablesElement.classList.add("chart-master__labels"));
    let t = (90 - 360 / this.data.length / 2) * Math.PI / 180;
    const s = 2 * Math.PI / this.data.length;
    for (let i = 0; i < this.data.length; i++) {
      const e = this.params.centerX + (this.params.radius + this.options.labelOffset) * Math.cos(t), o = this.params.centerY + (this.params.radius + this.options.labelOffset) * Math.sin(t), a = document.createElement("div");
      a.classList.add("chart-master__label"), a.style.setProperty("--angle", `${t * 180 / Math.PI}deg`), a.style.setProperty("--x", `${e}px`), a.style.setProperty("--y", `${o}px`), this.lablesElement.append(a), a.textContent = this.data[i].label, t += s;
    }
    this.chartWrapper.append(this.lablesElement);
  }
  drawsDots() {
    for (const t of this.dots)
      this.ctx.fillStyle = this.options.dotColor, this.options.dotBorderWidth && (this.ctx.lineWidth = this.options.dotBorderWidth, this.ctx.strokeStyle = this.options.dotBorderColor), this.ctx.beginPath(), this.ctx.arc(t.x, t.y, 4, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.fill();
  }
  handleMouseMove(t) {
    const s = this.canvas.getBoundingClientRect(), i = t.clientX - s.left, e = t.clientY - s.top;
    for (const [o, a] of this.dots.entries())
      if (i >= a.x - this.options.dotRadius - this.options.iteractionAdditionalRadius && i <= a.x + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2 && e >= a.y - this.options.dotRadius - this.options.iteractionAdditionalRadius && e <= a.y + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2) {
        this.hoveredDotIndex = o;
        break;
      } else
        this.hoveredDotIndex = void 0;
    if (this.hoveredDotIndex === void 0)
      this.backChartState();
    else if (this.hoveredDotIndex !== this.prevHoveredDotIndex && (this.prevHoveredDotIndex = this.hoveredDotIndex, this.options.onDotHover && typeof this.options.onDotHover == "function" && this.options.onDotHover({
      index: this.hoveredDotIndex,
      value: this.dots[this.hoveredDotIndex].value
    }), this.options.tooltip)) {
      const o = {
        value: this.dots[this.hoveredDotIndex].value,
        label: this.options.tooltipLabel
      }, a = this.dots[this.hoveredDotIndex].x, r = this.dots[this.hoveredDotIndex].y;
      this.removeTooltip(), this.renderTooltip(o, a, r);
    }
  }
  backChartState() {
    this.options.tooltip && this.removeTooltip(), this.hoveredDotIndex = void 0, this.prevHoveredDotIndex = void 0;
  }
  handleMouseLeave() {
    this.backChartState();
  }
  localUpdate() {
  }
}
g.defaultOptions = {
  gridLineWidth: 1,
  gridColor: "#565656",
  axesLineWidth: 1,
  axesColor: "#000000",
  splitSections: 8,
  labelOffset: 20,
  labels: !0,
  lineWidth: 2,
  colorTransitionDuration: 200,
  bgSectionColor: "rgba(240, 55, 55, 0.4)",
  tooltip: !0,
  dots: !0,
  dotColor: "#ffffff",
  dotRadius: 3,
  dotBorderWidth: 2,
  dotBorderColor: "#000000",
  iteraction: !0,
  iteractionAdditionalRadius: 5,
  colorTransitionTimingFunction: function(h) {
    return h < 0.5 ? 2 * h * h : 1 - Math.pow(-2 * h + 2, 2) / 2;
  }
};
class v extends x {
  constructor(t) {
    super(t.element), this.data = t.data, this.options = Object.assign({}, v.defaultOptions, t.options), this.cssModificator = "polar", this.createLayout(), this.setMainParameters(), this.setSize(), this.setEvents(), this.setSectors(), this.mainRender();
  }
  setSectors() {
    this.sectors = [];
    let t = 0;
    const i = (2 * Math.PI - this.options.sectorGaps * (this.data.length - 1) * Math.PI / 180) / this.data.length;
    for (const e of this.data)
      this.sectors.push({
        color: e.color,
        hoverColor: e.hoverColor || this.lightenColor(e.color, this.options.lightenValue),
        currentColor: e.color,
        value: e.value,
        label: e.label,
        radius: e.value / this.params.maxValue * this.params.radius,
        startAngle: t,
        endAngle: t + i
      }), t += i + this.options.sectorGaps * Math.PI / 180;
  }
  setParameters() {
    this.params.totalValue = this.data.reduce((t, s) => t + s.value, 0), this.params.maxValue = Math.max(...this.data.map((t) => t.value)), this.params.padding = this.options.padding + this.options.borderWidth, this.params.radius = Math.min(this.params.width, this.params.height) / 2 - this.params.padding, this.params.centerX = this.params.width / 2, this.params.centerY = this.params.height / 2;
  }
  render() {
    this.drawGrid(), this.drawChart(), this.options.legend && this.drawLegend(), this.options.labels && this.renderLabels();
  }
  drawGrid() {
    for (let t = 0; t < this.options.rings; t++) {
      const s = this.params.radius * ((t + 1) / this.options.rings);
      this.drawRing(s);
    }
  }
  renderLabels() {
    this.lablesElement ? this.lablesElement.innerHTML = "" : (this.lablesElement = document.createElement("div"), this.lablesElement.classList.add("chart-master__labels"), this.chartWrapper.append(this.lablesElement));
    const t = this.params.maxValue / (this.options.rings - 1);
    for (let s = 0; s < this.options.rings; s++) {
      const i = this.params.radius * ((s + 1) / this.options.rings);
      this.lablesElement.append(this.renderLabel(i, s * t));
    }
  }
  drawRing(t) {
    this.ctx.beginPath(), this.ctx.arc(this.params.centerX, this.params.centerY, t, 0, 2 * Math.PI), this.ctx.strokeStyle = this.options.gridColor, this.ctx.lineWidth = this.options.gridLineWidth, this.ctx.stroke(), this.ctx.closePath();
  }
  renderLabel(t, s) {
    const i = this.options.axisLabelAngle * Math.PI / 180, e = this.params.centerX + t * Math.cos(i), o = this.params.centerY + t * Math.sin(i), a = document.createElement("div");
    return a.classList.add("chart-master__label"), a.textContent = Math.floor(s), a.style.setProperty("--x", `${e}px`), a.style.setProperty("--y", `${o}px`), a;
  }
  drawChart() {
    for (const t of this.sectors)
      this.drawSector(t.startAngle, t.endAngle, t.currentColor, t.radius);
  }
  drawSector(t, s, i, e) {
    this.ctx.beginPath(), this.ctx.moveTo(this.params.centerX, this.params.centerY), this.ctx.arc(this.params.centerX, this.params.centerY, e, t, s), this.ctx.closePath(), this.ctx.fillStyle = i, this.ctx.fill(), this.options.borderWidth > 0 && (this.ctx.strokeStyle = this.options.borderColor, this.ctx.lineWidth = this.options.borderWidth, this.ctx.stroke());
  }
  handleMouseMove(t) {
    const {
      offsetX: s,
      offsetY: i
    } = t, e = s - this.params.centerX, o = i - this.params.centerY, a = Math.sqrt(e * e + o * o);
    let r = Math.atan2(o, e);
    r < 0 && (r += 2 * Math.PI);
    const n = this.sectors.findIndex((l) => r > l.startAngle && r < l.endAngle && a < l.radius);
    if (n === -1)
      this.backChartState();
    else if (this.hoverSector !== n) {
      if (this.options.onSectortHover && typeof this.options.onSectortHover == "function" && this.options.onSectortHover({
        index: n,
        label: this.sectors[n].label,
        value: this.sectors[n].value / this.params.totalValue * 100,
        rawValue: this.sectors[n].value
      }), this.backChartState(), this.hoverSector = n, this.hoveredSectorColor = this.sectors[n].hoverColor, this.options.tooltip) {
        const l = {
          label: this.sectors[n].label,
          value: `${Number.parseFloat((this.sectors[n].value / this.params.totalValue * 100).toFixed(2))}%`
        }, d = (this.sectors[n].startAngle + this.sectors[n].endAngle) / 2, c = this.params.centerX + this.sectors[n].radius / 2 * Math.cos(d), u = this.params.centerY + this.sectors[n].radius / 2 * Math.sin(d);
        this.removeTooltip(), this.renderTooltip(l, c, u);
      }
      this.startAnimation();
    }
  }
  handleMouseLeave() {
    this.backChartState();
  }
  backChartState() {
    this.stopAnimation(), this.options.tooltip && this.removeTooltip(), this.hoverSector !== void 0 && (this.sectors[this.hoverSector].currentColor = this.sectors[this.hoverSector].color), this.hoverSector = void 0, this.mainRender();
  }
  animate() {
    if (this.hoverSector !== void 0) {
      const s = Date.now() - this.animationStartTime, i = Math.min(s / this.options.colorTransitionDuration, 1), e = this.options.colorTransitionTimingFunction(i);
      this.sectors[this.hoverSector].currentColor = this.interpolateColor(this.sectors[this.hoverSector].color, this.sectors[this.hoverSector].hoverColor, e), this.mainRender(), i < 1 && (this.animationFrameId = requestAnimationFrame(this.animate.bind(this)));
    }
  }
  localUpdate() {
    this.setSectors();
  }
}
v.defaultOptions = {
  borderWidth: 0,
  borderColor: "#000000",
  padding: 0,
  legend: !0,
  lightenValue: 50,
  tooltip: !0,
  labels: !0,
  iteraction: !0,
  rings: 10,
  sectorGaps: 0,
  gridColor: "#cecece",
  gridLineWidth: 1,
  axisLabelAngle: -90,
  colorTransitionTimingFunction: function(h) {
    return h < 0.5 ? 2 * h * h : 1 - Math.pow(-2 * h + 2, 2) / 2;
  },
  colorTransitionDuration: 200
};
class f extends x {
  constructor(t) {
    super(t.element), this.data = t.data, this.options = Object.assign({}, f.defaultOptions, t.options), this.cssModificator = "bar", this.createLayout(), this.setMainParameters(), this.mainRender(), this.setEvents();
  }
  render() {
    this.setBars(), this.setSize(), this.drawChart(), this.drawLegend(), this.options.labelsX && this.renderLabelsX(), this.options.labelsY && this.renderLabelsY();
  }
  setParameters() {
    this.maxBarValue = 0, this.minBarValue = 0;
    for (const t of this.data)
      t.value > this.maxBarValue && (this.maxBarValue = t.value), t.value < this.minBarValue && (this.minBarValue = t.value);
    this.unitToPx = this.params.height / (Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom);
  }
  setBars() {
    this.bars = [];
    const t = this.data.length * this.options.barWidth + (this.data.length - 1) * this.options.barSpacing;
    let i = (this.params.width - t) / 2;
    for (const e of this.data) {
      const o = Math.abs(e.value) * this.unitToPx, a = e.value > 0 ? (this.maxBarValue + this.options.paddingTop - e.value) * this.unitToPx + 0.5 : (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5;
      this.bars.push({
        value: e.value,
        label: e.label,
        x: i,
        y: a,
        height: o,
        width: this.options.barWidth
      }), i += this.options.barSpacing + this.options.barWidth;
    }
  }
  drawChart() {
    this.drawGrid(), this.drawBars();
  }
  drawGrid() {
    this.options.gridY && this.drawGridY(), this.options.gridX && this.drawGridX();
  }
  drawGridY() {
    const t = Math.floor((Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom) / this.options.yAxisSplitNumber);
    this.ctx.strokeStyle = this.options.gridYColor, this.ctx.lineWidth = this.options.gridYWidth, this.ctx.textAlign = "right", this.ctx.beginPath(), this.ctx.moveTo(0, (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5), this.ctx.lineTo(this.params.width, (this.maxBarValue + this.options.paddingTop) * this.unitToPx + 0.5);
    for (let s = this.maxBarValue + this.options.paddingTop - t; s > 0; s -= t)
      this.ctx.moveTo(0, s * this.unitToPx + 0.5), this.ctx.lineTo(this.params.width, s * this.unitToPx + 0.5);
    for (let s = this.maxBarValue + this.options.paddingTop + t; s < Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop; s += t)
      this.ctx.moveTo(0, s * this.unitToPx + 0.5), this.ctx.lineTo(this.params.width, s * this.unitToPx + 0.5);
    this.ctx.stroke();
  }
  drawGridX() {
    this.ctx.strokeStyle = this.options.gridXColor, this.ctx.lineWidth = this.options.gridYWidth, this.ctx.beginPath();
    const t = this.data.length * this.options.barWidth + (this.data.length - 1) * this.options.barSpacing;
    let i = (this.params.width - t) / 2 - this.options.barSpacing / 2;
    for (let e = 0; e < this.data.length + 1; e++)
      this.ctx.moveTo(i, 0), this.ctx.lineTo(i, this.params.height), i += this.options.barSpacing + this.options.barWidth;
    this.ctx.stroke();
  }
  drawBars() {
    for (const [t, s] of this.bars.entries())
      this.ctx.fillStyle = t === this.hoveredBarIndex ? this.hoveredBarColor : this.options.barColor, this.ctx.beginPath(), this.ctx.roundRect(s.x, s.y, this.options.barWidth, s.height, this.options.barBorderRadius), this.ctx.fill(), this.options.barBorderWidth !== 0 && (this.ctx.strokeStyle = this.options.barBorderColor, this.ctx.lineWidth = this.options.barBorderWidth, this.ctx.strokeRect(s.x, s.y, this.options.barWidth, s.height), this.ctx.stroke());
  }
  renderLabelsY() {
    this.lablesYElement ? this.lablesYElement.innerHTML = "" : (this.lablesYElement = document.createElement("div"), this.lablesYElement.classList.add("chart-master__labels"), this.lablesYElement.classList.add("chart-master__labels--y"), this.chartWrapper.classList.add("chart-master__wrapper--pl")), this.labelsY = [], this.labelsY.push({
      value: 0,
      yCoord: (this.maxBarValue + this.options.paddingTop) * this.unitToPx
    });
    const t = Math.floor((Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop + this.options.paddingBottom) / this.options.yAxisSplitNumber);
    let s = t;
    for (let i = this.maxBarValue + this.options.paddingTop - t; i > 0; i -= t)
      this.labelsY.unshift({
        value: s,
        yCoord: i * this.unitToPx
      }), s += t;
    s = -t;
    for (let i = this.maxBarValue + this.options.paddingTop + t; i < Math.abs(this.minBarValue) + this.maxBarValue + this.options.paddingTop; i += t)
      this.labelsY.push({
        value: s,
        yCoord: i * this.unitToPx
      }), s -= t;
    for (const i of this.labelsY) {
      const e = document.createElement("div");
      e.classList.add("chart-master__label"), e.textContent = i.value, e.style.setProperty("--y", `${i.yCoord}px`), this.lablesYElement.append(e);
    }
    this.chartWrapper.append(this.lablesYElement);
  }
  renderLabelsX() {
    this.lablesXElement ? this.lablesXElement.innerHTML = "" : (this.lablesXElement = document.createElement("div"), this.lablesXElement.classList.add("chart-master__labels"), this.lablesXElement.classList.add("chart-master__labels--x"), this.chartWrapper.classList.add("chart-master__wrapper--pb")), this.labelsX = [];
    for (const t of this.bars)
      this.labelsX.push({
        label: t.label,
        xCoord: t.x + this.options.barWidth / 2
      });
    for (const t of this.labelsX) {
      const s = document.createElement("div");
      s.classList.add("chart-master__label"), s.textContent = t.label, s.style.setProperty("--x", `${t.xCoord}px`), this.lablesXElement.append(s);
    }
    this.chartWrapper.append(this.lablesXElement);
  }
  handleMouseMove(t) {
    const s = this.canvas.getBoundingClientRect(), i = t.clientX - s.left, e = t.clientY - s.top;
    if (this.hoveredBarIndex = this.options.barBorderRadius === 0 ? this.checkHoverRect(i, e) : this.checkHoverWithCorner(i, e), this.hoveredBarIndex === void 0)
      this.backChartState();
    else if (this.hoveredBarIndex !== this.prevHoveredBarIndex) {
      if (this.prevHoveredBarIndex = this.hoveredBarIndex, this.options.onBarHover && typeof this.options.onBarHover == "function" && this.options.onBarHover({
        index: this.hoveredBarIndex,
        label: this.bars[this.hoveredBarIndex].label,
        value: this.bars[this.hoveredBarIndex].value
      }), this.options.tooltip) {
        const o = {
          label: this.bars[this.hoveredBarIndex].label,
          value: this.bars[this.hoveredBarIndex].value
        }, a = this.bars[this.hoveredBarIndex].x + this.options.barWidth / 2, r = this.bars[this.hoveredBarIndex].y + this.bars[this.hoveredBarIndex].height / 2;
        this.removeTooltip(), this.renderTooltip(o, a, r);
      }
      this.startAnimation();
    }
  }
  checkHoverWithCorner(t, s) {
    const i = document.createElement("canvas");
    i.width = this.params.width, i.height = this.params.height;
    const e = i.getContext("2d");
    for (let o = 0; o < this.bars.length; o++) {
      const a = this.bars[o], {
        x: r,
        y: n,
        width: l,
        height: d
      } = a;
      if (e.clearRect(0, 0, i.width, i.height), e.beginPath(), e.moveTo(r + this.options.barBorderRadius, n), e.lineTo(r + l - this.options.barBorderRadius, n), e.arcTo(r + l, n, r + l, n + this.options.barBorderRadius, this.options.barBorderRadius), e.lineTo(r + l, n + d - this.options.barBorderRadius), e.arcTo(r + l, n + d, r + l - this.options.barBorderRadius, n + d, this.options.barBorderRadius), e.lineTo(r + this.options.barBorderRadius, n + d), e.arcTo(r, n + d, r, n + d - this.options.barBorderRadius, this.options.barBorderRadius), e.lineTo(r, n + this.options.barBorderRadius), e.arcTo(r, n, r + this.options.barBorderRadius, n, this.options.barBorderRadius), e.closePath(), e.isPointInPath(t, s))
        return o;
    }
  }
  checkHoverRect(t, s) {
    for (const [i, e] of this.bars.entries())
      if (t >= e.x && t <= e.x + e.width && s >= e.y && s <= e.y + e.height)
        return i;
  }
  handleMouseLeave() {
    this.backChartState();
  }
  animate() {
    if (this.hoveredBarIndex !== void 0) {
      const s = Date.now() - this.animationStartTime, i = Math.min(s / this.options.colorTransitionDuration, 1), e = this.options.colorTransitionTimingFunction(i);
      this.hoveredBarColor = this.interpolateColor(this.options.barColor, this.options.hoverBarColor || this.lightenColor(this.options.barColor, this.options.lightenValue), e), this.drawBars(), i < 1 && (this.animationFrameId = requestAnimationFrame(this.animate.bind(this)));
    }
  }
  backChartState() {
    this.stopAnimation(), this.options.tooltip && this.removeTooltip(), this.hoveredBarIndex !== void 0 && (this.hoveredBarColor = this.options.barColor), this.hoveredBarIndex = void 0, this.prevHoveredBarIndex = void 0, this.drawBars();
  }
  localUpdate() {
    this.setBars();
  }
}
f.defaultOptions = {
  gridYColor: "#d4d4d4",
  gridXColor: "#d4d4d4",
  gridYWidth: 1,
  gridXWidth: 1,
  barColor: "#29c5f6",
  barBorderColor: "#000000",
  barBorderWidth: 0,
  barWidth: 50,
  barSpacing: 30,
  barBorderRadius: 0,
  yAxisSplitNumber: 10,
  paddingTop: 2,
  paddingBottom: 2,
  legend: !0,
  labelsX: !0,
  labelsY: !0,
  gridX: !0,
  gridY: !0,
  iteraction: !0,
  lightenValue: 50,
  tooltip: !0,
  colorTransitionTimingFunction: function(h) {
    return h < 0.5 ? 2 * h * h : 1 - Math.pow(-2 * h + 2, 2) / 2;
  },
  colorTransitionDuration: 200
};
class T extends x {
  constructor(t) {
    super(t.element), this.data = t.data, this.options = Object.assign({}, T.defaultOptions, t.options), this.cssModificator = "line", this.createLayout(), this.setMainParameters(), this.setSize(), this.mainRender(), this.setEvents();
  }
  setDots() {
    this.dots = [];
    const t = (this.params.width - 2 * this.options.padding) / (this.data.length - 1), s = (this.params.height - 2 * this.options.padding) / (Math.max(...this.data) - Math.min(...this.data));
    for (const [i, e] of this.data.entries()) {
      const o = this.options.padding + i * t, a = this.params.height - this.options.padding - (e - Math.min(...this.data)) * s;
      this.dots.push({
        x: o,
        y: a,
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
      const t = (this.params.width - 2 * this.options.padding) / (this.data.length - 1);
      for (let s = 0; s < this.data.length; s++) {
        const i = this.options.padding + s * t;
        this.ctx.moveTo(i, this.params.height - this.options.padding - this.options.axisXTickLength / 2), this.ctx.lineTo(i, this.params.height - this.options.padding + this.options.axisXTickLength / 2);
      }
    }
    if (this.options.gridY) {
      this.ctx.lineWidth = this.options.axisYWidth, this.ctx.strokeStyle = this.options.axisYColor, this.ctx.moveTo(this.options.padding, this.options.padding), this.ctx.lineTo(this.options.padding, this.params.height - this.options.padding);
      const t = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber;
      this.ctx.strokeStyle = this.options.axisYTickColor, this.ctx.lineWidth = this.options.axisYTickWidth;
      for (let s = 0; s <= this.options.yAxisSplitNumber; s++) {
        const i = this.params.height - this.options.padding - s * t;
        this.ctx.moveTo(this.options.padding - this.options.axisYTickLength / 2, i), this.ctx.lineTo(this.options.padding + this.options.axisYTickLength / 2, i);
      }
    }
    this.ctx.stroke();
  }
  drawGrid() {
    if (this.ctx.beginPath(), this.options.gridY) {
      this.ctx.lineWidth = this.options.gridXWidth, this.ctx.strokeStyle = this.options.gridXColor;
      const t = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber;
      for (let s = 0; s <= this.options.yAxisSplitNumber; s++) {
        const i = this.params.height - this.options.padding - s * t;
        this.ctx.moveTo(this.options.padding, i), this.ctx.lineTo(this.params.width - this.options.padding, i);
      }
    }
    if (this.options.gridX) {
      this.ctx.lineWidth = this.options.gridYWidth, this.ctx.strokeStyle = this.options.gridYColor;
      const t = (this.params.width - 2 * this.options.padding) / (this.data.length - 1);
      for (let s = 0; s < this.data.length; s++) {
        const i = this.options.padding + s * t;
        this.ctx.moveTo(i, this.options.padding), this.ctx.lineTo(i, this.params.height - this.options.padding);
      }
    }
    this.ctx.stroke();
  }
  drawGraph() {
    this.ctx.beginPath(), this.ctx.strokeStyle = this.options.lineColor, this.ctx.lineWidth = this.options.lineWidth, this.options.interpolation ? this.drawInterpolationLine() : this.drawLine();
  }
  drawLine() {
    for (const [t, s] of this.dots.entries())
      t === 0 ? this.ctx.moveTo(s.x, s.y) : this.ctx.lineTo(s.x, s.y);
    this.ctx.stroke();
  }
  drawInterpolationLine() {
    for (let t = 0; t < this.dots.length - 1; t++) {
      const s = this.dots[t], i = this.dots[t + 1], e = s.x + (i.x - s.x) / 3 * this.options.tensionCoeff, o = s.y, a = i.x - (i.x - s.x) / 3 * this.options.tensionCoeff, r = i.y;
      this.ctx.moveTo(s.x, s.y), this.ctx.bezierCurveTo(e, o, a, r, i.x, i.y);
    }
    this.ctx.stroke();
  }
  drawsDots() {
    for (const t of this.dots)
      this.ctx.fillStyle = this.options.dotColor, this.options.dotBorderWidth && (this.ctx.lineWidth = this.options.dotBorderWidth, this.ctx.strokeStyle = this.options.dotBorderColor), this.ctx.beginPath(), this.ctx.arc(t.x, t.y, 4, 0, 2 * Math.PI), this.ctx.stroke(), this.ctx.fill();
  }
  renderLabelsY() {
    this.lablesYElement ? this.lablesYElement.innerHTML = "" : (this.lablesYElement = document.createElement("div"), this.lablesYElement.classList.add("chart-master__labels"), this.lablesYElement.classList.add("chart-master__labels--y"), this.chartWrapper.classList.add("chart-master__wrapper--pl")), this.labelsY = [];
    const t = (this.params.height - 2 * this.options.padding) / this.options.yAxisSplitNumber, s = Math.max(...this.data), i = Math.min(...this.data);
    this.ctx.strokeStyle = this.options.axisYTickColor, this.ctx.lineWidth = this.options.axisYTickWidth;
    for (let e = 0; e <= this.options.yAxisSplitNumber; e++) {
      const o = this.params.height - this.options.padding - e * t, a = i + (s - i) * (e / this.options.yAxisSplitNumber);
      this.labelsY.push({
        value: a,
        yCoord: o
      });
    }
    for (const e of this.labelsY) {
      const o = document.createElement("div");
      o.classList.add("chart-master__label"), o.textContent = e.value, o.style.setProperty("--y", `${e.yCoord}px`), this.lablesYElement.append(o);
    }
    this.chartWrapper.append(this.lablesYElement);
  }
  renderLabelsX() {
    this.lablesXElement ? this.lablesXElement.innerHTML = "" : (this.lablesXElement = document.createElement("div"), this.lablesXElement.classList.add("chart-master__labels"), this.lablesXElement.classList.add("chart-master__labels--x"), this.chartWrapper.classList.add("chart-master__wrapper--pb")), this.labelsX = [];
    const t = (this.params.width - 2 * this.options.padding) / (this.data.length - 1);
    for (let s = 0; s < this.data.length; s++) {
      const i = this.options.padding + s * t;
      this.labelsX.push({
        label: s,
        xCoord: i
      });
    }
    for (const s of this.labelsX) {
      const i = document.createElement("div");
      i.classList.add("chart-master__label"), i.textContent = s.label, i.style.setProperty("--x", `${s.xCoord}px`), this.lablesXElement.append(i);
    }
    this.chartWrapper.append(this.lablesXElement);
  }
  render() {
    this.setDots(), this.drawChart(), this.options.labelsX && this.renderLabelsX(), this.options.labelsY && this.renderLabelsY();
  }
  handleMouseMove(t) {
    const s = this.canvas.getBoundingClientRect(), i = t.clientX - s.left, e = t.clientY - s.top;
    for (const [o, a] of this.dots.entries())
      if (i >= a.x - this.options.dotRadius - this.options.iteractionAdditionalRadius && i <= a.x + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2 && e >= a.y - this.options.dotRadius - this.options.iteractionAdditionalRadius && e <= a.y + (this.options.dotRadius + this.options.iteractionAdditionalRadius) * 2) {
        this.hoveredDotIndex = o;
        break;
      } else
        this.hoveredDotIndex = void 0;
    if (this.hoveredDotIndex === void 0)
      this.backChartState();
    else if (this.hoveredDotIndex !== this.prevHoveredDotIndex && (this.prevHoveredDotIndex = this.hoveredDotIndex, this.options.onDotHover && typeof this.options.onDotHover == "function" && this.options.onDotHover({
      index: this.hoveredDotIndex,
      value: this.dots[this.hoveredDotIndex].value
    }), this.options.tooltip)) {
      const o = {
        value: this.dots[this.hoveredDotIndex].value,
        label: this.options.tooltipLabel
      }, a = this.dots[this.hoveredDotIndex].x, r = this.dots[this.hoveredDotIndex].y;
      this.removeTooltip(), this.renderTooltip(o, a, r);
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
T.defaultOptions = {
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
  tooltip: !0,
  dots: !1,
  dotColor: "#ffffff",
  dotRadius: 3,
  dotBorderWidth: 2,
  dotBorderColor: "#000000",
  iteraction: !0,
  iteractionAdditionalRadius: 4,
  tooltipLabel: "",
  colorTransitionTimingFunction: function(h) {
    return h < 0.5 ? 2 * h * h : 1 - Math.pow(-2 * h + 2, 2) / 2;
  }
};
class y extends x {
  constructor(t) {
    super(t.element), this.data = t.data, this.options = Object.assign({}, y.defaultOptions, t.options), this.cssModificator = "pie", this.createLayout(), this.setMainParameters(), this.setSize(), this.setSegments(), this.setEvents(), this.mainRender();
  }
  setSegments() {
    let t = 0;
    this.segments = [];
    for (const s of this.data) {
      const i = 2 * Math.PI * s.value / this.params.totalValue;
      this.segments.push({
        color: s.color,
        hoverColor: s.hoverColor || this.lightenColor(s.color, this.options.lightenValue),
        currentColor: s.color,
        value: s.value,
        label: s.label,
        startAngle: t,
        endAngle: t + i
      }), t += i;
    }
  }
  setParameters() {
    this.params.totalValue = this.data.reduce((t, s) => t + s.value, 0), this.params.padding = this.options.padding + this.options.borderWidth, this.params.radius = Math.min(this.params.width, this.params.height) / 2 - this.params.padding, this.params.centerX = this.params.width / 2, this.params.centerY = this.params.height / 2;
  }
  render() {
    this.drawChart(), this.drawLegend(), this.options.labels && this.renderLabels();
  }
  drawSegment(t, s, i) {
    this.ctx.beginPath(), this.ctx.moveTo(this.params.centerX, this.params.centerY), this.ctx.arc(this.params.centerX, this.params.centerY, this.params.radius, t, s), this.ctx.closePath(), this.ctx.fillStyle = i, this.ctx.fill(), this.options.borderWidth > 0 && (this.ctx.strokeStyle = this.options.borderColor, this.ctx.lineWidth = this.options.borderWidth, this.ctx.stroke());
  }
  drawChart() {
    for (const t of this.segments)
      this.drawSegment(t.startAngle, t.endAngle, t.currentColor);
  }
  handleMouseMove(t) {
    const {
      offsetX: s,
      offsetY: i
    } = t, e = s - this.params.centerX, o = i - this.params.centerY, a = Math.sqrt(e * e + o * o);
    let r = Math.atan2(o, e);
    r < 0 && (r += 2 * Math.PI);
    const n = this.segments.findIndex((l) => r > l.startAngle && r < l.endAngle);
    if (n === -1 || a > this.params.radius)
      this.backChartState();
    else if (this.hoverSegment !== n) {
      if (this.options.onSegmentHover && typeof this.options.onSegmentHover == "function" && this.options.onSegmentHover({
        index: n,
        label: this.segments[n].label,
        value: this.segments[n].value / this.params.totalValue * 100,
        rawValue: this.segments[n].value
      }), this.backChartState(), this.hoverSegment = n, this.hoveredSegmentColor = this.segments[n].hoverColor, this.options.tooltip) {
        const l = {
          label: this.segments[n].label,
          value: `${Number.parseFloat((this.segments[n].value / this.params.totalValue * 100).toFixed(2))}%`
        }, d = (this.segments[n].startAngle + this.segments[n].endAngle) / 2, c = this.params.centerX + this.params.radius / 2 * Math.cos(d), u = this.params.centerY + this.params.radius / 2 * Math.sin(d);
        this.removeTooltip(), this.renderTooltip(l, c, u);
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
    this.lablesElement ? this.lablesElement.innerHTML = "" : (this.lablesElement = document.createElement("div"), this.lablesElement.classList.add("chart-master__labels"));
    for (const t of this.segments) {
      const s = document.createElement("div");
      s.classList.add("chart-master__label"), s.innerHTML = `
      <div class="chart__label-label">${t.label}</div>
      <div class="chart__label-value">${Number.parseFloat((t.value / this.params.totalValue * 100).toFixed(2))}%</div>
      `;
      const i = (t.startAngle + t.endAngle) / 2, e = this.params.centerX + this.params.radius / 2 * Math.cos(i), o = this.params.centerY + this.params.radius / 2 * Math.sin(i);
      s.style.setProperty("--angle", `${i * 180 / Math.PI}deg`), s.style.setProperty("--center-x", `${e}px`), s.style.setProperty("--center-y", `${o}px`), this.lablesElement.append(s);
    }
    this.chartWrapper.append(this.lablesElement);
  }
  animate() {
    if (this.hoverSegment !== void 0) {
      const s = Date.now() - this.animationStartTime, i = Math.min(s / this.options.colorTransitionDuration, 1), e = this.options.colorTransitionTimingFunction(i);
      this.segments[this.hoverSegment].currentColor = this.interpolateColor(this.segments[this.hoverSegment].color, this.segments[this.hoverSegment].hoverColor, e), this.drawChart(), i < 1 && (this.animationFrameId = requestAnimationFrame(this.animate.bind(this)));
    }
  }
  localUpdate() {
    this.setSegments();
  }
}
y.defaultOptions = {
  borderWidth: 0,
  borderColor: "#000000",
  padding: 0,
  legend: !0,
  lightenValue: 50,
  tooltip: !0,
  labels: !1,
  iteraction: !0,
  colorTransitionTimingFunction: function(h) {
    return h < 0.5 ? 2 * h * h : 1 - Math.pow(-2 * h + 2, 2) / 2;
  },
  colorTransitionDuration: 200
};
export {
  x as ChartMaster,
  y as default
};
