import * as React from 'react';
import { Announced } from 'office-ui-fabric-react/lib/Announced';
import { TextField, Dropdown, IDropdownOption } from 'office-ui-fabric-react/lib';
import { DetailsList, DetailsListLayoutMode, Selection, IColumn } from 'office-ui-fabric-react/lib/DetailsList';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling';
import { ITableProps } from './ITableProps';
import pnp, { List, App, Web } from "sp-pnp-js";
import * as $ from 'jquery';
const exampleChildClass = mergeStyles({
  display: 'block',
  marginBottom: '10px'
});

let values = [];
let totalItem = 0;
let ReportOption: IDropdownOption[] = [];
let selectedValue = "All";
export interface IDetailsListBasicExampleItem {
  Title: string;
  Status: string;
  TotalItems: string;
  Completed: string;
  PerComplete: string;
}

export interface IDetailsListBasicExampleState {
  items: IDetailsListBasicExampleItem[];
  selectionDetails: string;
}
let TableItems = [];
export default class Table extends React.Component<ITableProps, IDetailsListBasicExampleState> {
  private _selection: Selection;
  private _allItems: IDetailsListBasicExampleItem[];
  private _columns: IColumn[];

  constructor(props: ITableProps) {
    super(props);

    this._selection = new Selection({
      onSelectionChanged: () => this.setState({ selectionDetails: this._getSelectionDetails() })
    });

    // Populate with items for demos.
    this._allItems = [];

    this._columns = [
      { key: 'Title', name: 'Title', fieldName: 'Title', minWidth: 100, maxWidth: 200, isResizable: true },
      { key: 'Status', name: 'Status', fieldName: 'Status', minWidth: 100, maxWidth: 200, isResizable: true },
      { key: 'Total Items', name: 'Total Items', fieldName: 'TotalItems', minWidth: 100, maxWidth: 200, isResizable: true },
      { key: 'Completed', name: 'Completed', fieldName: 'Completed', minWidth: 100, maxWidth: 200, isResizable: true },
      { key: '% Completed', name: '% Completed', fieldName: 'PerComplete', minWidth: 100, maxWidth: 200, isResizable: true },
    ];

    this.state = {
      items: this._allItems,
      selectionDetails: this._getSelectionDetails()
    };
  }

  public async componentDidUpdate(prevProps, prevState) {
    if (prevProps.Site !== this.props.Site || prevProps.List !== this.props.List) {
      TableItems = [];
      this.getlistItems();
    }
  }
  public async componentDidMount() {
    TableItems = [];
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

  public async getlistItems() {
    let web = new Web(this.props.Site);
    await web.lists.getByTitle(this.props.List).items.get().then((items: any[]) => {

      items=$.grep(items,(e,val)=>{return e["Component"]!=selectedValue;});

      for (const key of items) {
        key["FixVersion"] = key["FixVersion"].substring(5, key.length);
      }

      const personGroupedByColor = this.groupByStatus(items, "FixVersion");
      Object.keys(personGroupedByColor).forEach(key => {

          var temp = [];
          temp.push(key);
          let completedCount = 0;
          totalItem = personGroupedByColor[key].length;
          let tempStatus = [];
          Object.keys(personGroupedByColor[key]).forEach(key1 => {
            tempStatus.push(personGroupedByColor[key][key1]["Status"]);
            if (personGroupedByColor[key][key1]["Status"] == "Done") {
              completedCount++;
            }
          });
          if (completedCount == totalItem) {
            temp.push("Completed");
          }
          else {
            temp.push("In Progress");
          }
          temp.push(personGroupedByColor[key].length);
          temp.push(completedCount);
          temp.push((completedCount / totalItem) * 100);

          this._allItems.push({
            Title: temp[0],
            Status: temp[1],
            TotalItems: temp[2],
            Completed: temp[3],
            PerComplete: temp[4],
          });
         // console.log(this._allItems);
        
      });
      TableItems = this._allItems;
      this.setState({
        items: this._allItems
      });

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

  private handleReportComapnyDropDownOnChange = async (
    ev: any,
    selectedOption: any | undefined
  ): Promise<void> => {
    const selectedKey: string = selectedOption
      ? (selectedOption.text as string)
      : "";
      selectedValue=selectedOption.text;
      TableItems = [];
      this._allItems=[];
      this.getlistItems();
  }
  public render(): JSX.Element {
    const { items, selectionDetails } = this.state;

    return (

      <Fabric>
        <div className={exampleChildClass}>{selectionDetails}</div>
        <div style={{ width: "50%" }}>
        <div>Select Component</div>
          <Dropdown placeholder="Select an option" options={ReportOption} onChange={this.handleReportComapnyDropDownOnChange} />
        </div>
        <Announced message={selectionDetails} />
        <TextField
          className={exampleChildClass}
          label="Filter by name:"
          onChange={this._onFilter}
          styles={{ root: { maxWidth: '300px' } }}
        />
        <Announced message={`Number of items after filter applied: ${items.length}.`} />
        <MarqueeSelection selection={this._selection}>
          <DetailsList
            items={TableItems}
            columns={this._columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selection={this._selection}
            selectionPreservedOnEmptyClick={true}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            checkButtonAriaLabel="Row checkbox"
            onItemInvoked={this._onItemInvoked}
          />
        </MarqueeSelection>
      </Fabric>
    );
  }

  private _getSelectionDetails(): string {
    const selectionCount = this._selection.getSelectedCount();

    switch (selectionCount) {
      case 0:
        return 'No items selected';
      case 1:
        return '1 item selected: ' + (this._selection.getSelection()[0] as IDetailsListBasicExampleItem).Title;
      default:
        return `${selectionCount} items selected`;
    }
  }

  private _onFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string): void => {
    this.setState({
      items: text ? this._allItems.filter(i => i.Title.toLowerCase().indexOf(text) > -1) : this._allItems
    });
    //console.log(this._allItems);
    TableItems = text ? this._allItems.filter(i => i.Title.toLowerCase().indexOf(text) > -1) : this._allItems;
  }

  private _onItemInvoked = (item: IDetailsListBasicExampleItem): void => {
    alert(`Item invoked: ${item.Title}`);
  }
}
