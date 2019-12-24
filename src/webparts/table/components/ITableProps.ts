import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ITableProps {
  description: string;
  context: WebPartContext;
  Site: string;
  List:string;
}
