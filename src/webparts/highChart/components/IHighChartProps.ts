import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IHighChartProps {
  title: string;
  Site: string;
  List: string;
  currentUser: string;
  context: WebPartContext;
}
