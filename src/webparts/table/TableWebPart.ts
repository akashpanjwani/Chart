import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import * as pnp from '@pnp/sp';
import * as strings from 'TableWebPartStrings';
import Table from './components/Table';
import { ITableProps } from './components/ITableProps';

export default class TableWebPart extends BaseClientSideWebPart<ITableProps> {

  public onInit(): Promise<void> {
    return super.onInit().then(_ => {
      pnp.sp.setup({
        spfxContext: this.context
      });
    });
  }


  protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
      super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);
  }

  public render(): void {
    const element: React.ReactElement<ITableProps > = React.createElement(
      Table,
      {
        description: this.properties.description,
        context: this.context,
        Site: this.properties.Site || "",
        List:this.properties.List || ""
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected get disableReactivePropertyChanges(): boolean {
    return true;
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
