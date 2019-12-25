require('highcharts');
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  IPropertyPaneDropdownOption
} from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';
import styles from './ProgressBarWebPart.module.scss';
import * as strings from 'ProgressBarWebPartStrings';
import * as $ from 'jquery';
import { SPComponentLoader } from "@microsoft/sp-loader";
import pnp, { List, Web } from "sp-pnp-js";

import * as Highcharts from 'highcharts';
import { IProgressBarWebPartProps } from './IProgressBarWebPartProps';
import { IDropdownOption } from 'office-ui-fabric-react';

let result = [];
let values = [];
let ListItemsArr = [];

let totalLength = 0;
let completedCount = 0;
let webUrl;

let ReportOption: IDropdownOption[] = [];
let selectedValue = "All";


export default class ProgressBarWebPart extends BaseClientSideWebPart<IProgressBarWebPartProps> {

  private listDropDownOptions: IPropertyPaneDropdownOption[] = [];
  
  public render(): void {
    let mythis = this;
    SPComponentLoader.loadScript("https://code.jquery.com/jquery-3.1.1.min.js").then(() => {
      SPComponentLoader.loadScript("https://code.highcharts.com/highcharts.js").then(() => {
        SPComponentLoader.loadScript("https://rawgit.com/highcharts/rounded-corners/master/rounded-corners.js").then(async () => {
          this.domElement.innerHTML = `
          <div style={{ width: "50%" }}>
      <div class="${ styles.progressBar}">
        <div class="${ styles.container}">
          <div id="container"></div>          
        </div>
      </div>`;
      
          //require('./CustomScript.js');
          await this.getAllListsFromWeb();
          await this.getOptions();
          this.getlistItems();
        });
      });
    });

  }


  public async getOptions() {
    let web = new Web(this.properties.Site);
    let list = web.lists.getByTitle(this.properties.List);
    list.fields.getByInternalNameOrTitle("Component").get().then(result => {
      let choices = result.Choices;

      $('#mySelect').append('<option value = "All">All</option>');
      for (var option of choices) {
        $('#mySelect').append('<option value ="' + option + '">' + option + '</option>');
      }
    });
  }


  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }

  public async getlistItems() {
    let web = new Web(this.properties.Site);
    await web.lists.getByTitle(this.properties.List).items.get().then((items: any[]) => {

      items=$.grep(items,(e,val)=>{return e["Component"]!=this.properties.Component;});

      totalLength = items.length;

      // Group by color as key to the person array
      const personGroupedByColor = this.groupByStatus(items, "Status");
      completedCount = personGroupedByColor["Ready for Test"].length;

      var per = (completedCount / totalLength) * 100;
      this.renderChart(totalLength, completedCount, per);
    });
  }

  private getAllListsFromWeb() {
    this.listDropDownOptions = [];
    let count: number = 0;

    let web = new Web(this.properties.Site);
    let list=web.lists.getByTitle(this.properties.List);
    list.fields.getByInternalNameOrTitle("Component").get().then(result => {
      let choices=result.Choices;
      this.listDropDownOptions.push({ key: "All", text:"All" });

      for (var option of choices) {
        this.listDropDownOptions.push({ key: option, text: option });
      }
    });
    this.context.propertyPane.refresh();
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

  public renderChart(totalLength, completedCount, per) {
    // Good code:
    var options: any = {
      title: {
        text: 'Increament Progress',
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
        pointWidth: per,
        borderWidth: 0,
        borderRadiusTopLeft: '4px',
        borderRadiusTopRight: '4px',
        borderRadiusBottomLeft: '4px',
        borderRadiusBottomRight: '4px',
        dataLabels: {
          className: 'highlight',
          format: totalLength + '/' + completedCount,
          enabled: true,
          align: 'right',
          style: {
            color: 'white',
            textOutline: false,
          }
        }
      }, {
        enableMouseTracking: false,
        data: [per],
        borderRadiusBottomLeft: '4px',
        borderRadiusBottomRight: '4px',
        color: 'navy',
        borderWidth: 0,
        pointWidth: per,
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
    };
    var chart = new Highcharts.Chart(options);

  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: "",// strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('Site', {
                  label: "Enter the Site URL"
                }),
                PropertyPaneTextField('List', {
                  label: "Enter the List Name"
                }),
                PropertyPaneDropdown('Component', {
                  label: "Select Component",
                  options: this.listDropDownOptions
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
