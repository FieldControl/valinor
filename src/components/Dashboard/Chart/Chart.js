import React from "react"

import Highcharts from "highcharts/highstock"

import HighchartsReact from "highcharts-react-official"

import HC_more from "highcharts/highcharts-more"
import Solid_Gauge from "highcharts/modules/solid-gauge"

HC_more(Highcharts)
Solid_Gauge(Highcharts)

class Chart extends React.Component {
  constructor(props) {
    super(props)
    this.chartComponent = React.createRef()

    this.state = {
      options: {
        chart: {
          type: "solidgauge",
          width: 190,
          height: 230,
        },
        title: {
          text: "Health Score(em %)",
        },
        tooltip: {
          enabled: false,
        },
        pane: {
          startAngle: 0,
          endAngle: 360,
          background: [
            {
              outerRadius: "112%",
              innerRadius: "88%",
              backgroundColor: "rgb(237, 238, 240)",
              borderWidth: 3,
            },
          ],
        },
        yAxis: {
          min: 0,
          max: 100,
          lineWidth: 0,
          tickPositions: [],
        },
        plotOptions: {
          solidgauge: {
            dataLabels: {
              enabled: true,
              borderWidth: 0,
              color: "#1A2C40",
              verticalAlign: "middle",
              y: 0,
              style: {
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
                fontSize: "25px",
              },
            },
            linecap: "round",
            stickyTracking: false,
            rounded: true,
          },
        },
        series: [
          {
            name: "",
            data: [
              {
                color: "#3f8600",
                radius: "112%",
                innerRadius: "88%",
                y: props.data,
              },
            ],
          },
        ],
        credits: {
          enabled: false,
        },
        loaded: true,
      },
    }
  }

  render() {
    return (
      <HighchartsReact
        constructorType={"chart"}
        ref={this.chartComponent}
        highcharts={Highcharts}
        options={this.state.options}
      />
    )
  }
}

export default Chart
