import BarChart from '../modules/bar-chart'
import LineChart from '../modules/line-chart'
import PieChart from '../modules/pie-chart'
import '../styles/style.scss'

export class LiteChart {
  constructor(type, settings) {
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
    }
  }
}

// document.addEventListener('DOMContentLoaded', function () {
//   const s1 = new LiteChart('pie', {
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
//   const s2 = new LiteChart('bar', {
//     element: document.querySelector('#chart2'),
//     data: [
//       { label: 'Category A', value: 60 },
//       { label: 'Category B', value: 25 },
//       { label: 'Category C', value: -65 },
//       { label: 'Category D', value: 15 }
//     ],
//     options: {
//       barColor: '#36A2EB'
//     }
//   })
//   const s3 = new LiteChart('line', {
//     element: document.querySelector('#chart3'),
//     data: [10, 5, 0, 90, 30, -10, 10],
//     options: {
//       barColor: '#36A2EB'
//     }
//   })
// })
