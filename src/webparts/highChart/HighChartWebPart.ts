import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';

import * as strings from 'HighChartWebPartStrings';
import HighChart from './components/HighChart';
import { IHighChartProps } from './components/IHighChartProps';
import * as pnp from '@pnp/sp';

export default class HighChartWebPart extends BaseClientSideWebPart<IHighChartProps> {

  public onInit(): Promise<void> {
    return super.onInit().then(_ => {
      pnp.sp.setup({
        spfxContext: this.context
      });
    });
  }


  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }
  
  public render(): void {
    const element: React.ReactElement<IHighChartProps > = React.createElement(
      HighChart,
      {
        title: this.properties.title || "",
        currentUser: this.context.pageContext.user.displayName,
        context: this.context,
        Site: this.properties.Site || "",
        List:this.properties.List || ""
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
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
              groupName:"",// strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('Site', {
                  label: "Enter the Site URL"
                }),
                PropertyPaneTextField('List', {
                  label: "Enter the List Name"
                }),
              ]
            }
          ]
        }
      ]
    };
  }
}
