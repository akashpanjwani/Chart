var chart = new Highcharts.Chart({
    title: {
      text: 'Highcharts Progress Bar',
      align: 'left',
      margin: 0,
    },
    chart: {
      renderTo: 'container',
      type: 'bar',
      height: 70,
    },
    credits: false,
    tooltip: false,
    legend: false,
    navigation: {
      buttonOptions: {
        enabled: false
      }
    },
    xAxis: {
      visible: false,
    },
    yAxis: {
      visible: false,
      min: 0,
      max: 100,
    },
    series: [{
      data: [100],
      grouping: false,
      animation: false,
      enableMouseTracking: false,
      showInLegend: false,
      color: 'lightskyblue',
      pointWidth: 25,
      borderWidth: 0,
      borderRadiusTopLeft: '4px',
      borderRadiusTopRight: '4px',
      borderRadiusBottomLeft: '4px',
      borderRadiusBottomRight: '4px',
      dataLabels: {
        className: 'highlight',
        format: '150 / 600',
        enabled: true,
        align: 'right',
        style: {
          color: 'white',
          textOutline: false,
        }
      }
    }, {
      enableMouseTracking: false,
      data: [25],
      borderRadiusBottomLeft: '4px',
      borderRadiusBottomRight: '4px',
      color: 'navy',
      borderWidth: 0,
      pointWidth: 25,
      animation: {
        duration: 250,
      },
      dataLabels: {
        enabled: true,
        inside: true,
        align: 'left',
        format: '{point.y}%',
        style: {
          color: 'white',
          textOutline: false,
        }
      }
    }]
  });