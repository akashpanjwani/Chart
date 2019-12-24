import * as React from 'react';
import * as ReactDom from 'react-dom';
import { IHighChartProps } from './IHighChartProps';
import { IHighChartState } from './IHighChartState';
import drilldown from 'highcharts/modules/drilldown';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import * as pnp from '@pnp/sp';
import * as $ from 'jquery';
import { Web } from 'sp-pnp-js';
import { Dropdown, IDropdownOption } from 'office-ui-fabric-react';
drilldown(Highcharts);

let result = [];
let values = [];
let ListItemsArr = [];
let ReportOption: IDropdownOption[] = [];
let selectedValue = "All";

//const options: Highcharts.Options = 
let options: any = {};

let TableItems = [];
export default class Highchart extends React.Component<IHighChartProps, IHighChartState> {

  public constructor(props: IHighChartProps) {
    super(props);

    this.setState({
      ListItems: []
    });
  }

  private handleReportComapnyDropDownOnChange = async (
    ev: any,
    selectedOption: any | undefined
  ): Promise<void> => {
    const selectedKey: string = selectedOption
      ? (selectedOption.text as string)
      : "";
    selectedValue = selectedOption.text;
    ListItemsArr = [];
    this.getlistItems();
  }

  public async componentDidMount() {
    await this.getOptions();
    this.getlistItems();
  }

  public async getOptions() {
    let web = new Web(this.props.Site);
    let list=web.lists.getByTitle(this.props.List);
    list.fields.getByInternalNameOrTitle("Component").get().then(result => {
      let choices=result.Choices;
      ReportOption.push({
        key: "All",
        text:"All",
      });
      for (var option of choices) {
          ReportOption.push({
            key: option,
            text:option,
          });
      }
    });
  }

  public async componentDidUpdate(prevProps, prevState) {
    if (prevProps.Site !== this.props.Site || prevProps.List !== this.props.List) {
      ListItemsArr = [];
      this.getlistItems();
    }
  }

  public async getlistItems() {
    //let web = new pnp.web(this.props.site);
    let web = new Web(this.props.Site);
    await web.lists.getByTitle(this.props.List).items.get().then((items: any[]) => {

      items = $.grep(items, (e, val) => { return e["Component"] != selectedValue; });

      // Group by color as key to the person array
      const personGroupedByColor = this.groupByStatus(items, "Status");
      Object.keys(personGroupedByColor).forEach(key => {
        values.push(key);
        var temp = { "name": key, "y": personGroupedByColor[key].length };
        ListItemsArr.push(temp);
      });
      options = {
        chart: {
          renderTo: 'mycontainer',
          type: 'bar'
        },
        xAxis: {
          categories: values
        },
        title: {
          text: 'Status'
        },
        plotOptions: {
          series: {
            dataLabels: {
              enabled: true,
              format: '{point.name}: {point.y}'
            }
          }
        },

        tooltip: {
          headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
          pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
        },

        series: [
          {
            name: "No. of Issues per status",
            type: "bar",
            data: ListItemsArr
          }
        ]
      };
      var chart = new Highcharts.Chart(options);
    });
  }

  // Accepts the array and key
  public groupByStatus(array, key) {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue[key]] = result[currentValue[key]] || []).push(
        currentValue
      );
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  }


  private _myhighchart: HTMLElement = undefined;
  public render(): React.ReactElement<IHighChartProps> {
    //options["series"][0]["data"] = this.state == null ? [] : this.state.ListItems;
    return (
      <div>
        <div style={{ width: "50%" }}>
          <div>Select Component</div>
          <Dropdown placeholder="Select an option" options={ReportOption} onChange={this.handleReportComapnyDropDownOnChange} />
        </div>
        <div id="mycontainer">
          <HighchartsReact constructorType={'chart'} highcharts={Highcharts} options={options} />
        </div>
      </div>
    );
  }
}


