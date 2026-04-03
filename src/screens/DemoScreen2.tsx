import {
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";
import { useItemMaster } from "../hooks";
import { Loader } from "../components";

export const DemoScreen2: React.FC = () => {
  // ========== HOOKS
  const { data = [], isPending } = useItemMaster();

  // ========== VIEWS
  if (isPending) {
    return <Loader />;
  }

  return (
    <Table
      headerRow={
        <TableHeaderRow sticky>
          <TableHeaderCell>
            <span>Item Code</span>
          </TableHeaderCell>
          <TableHeaderCell>
            <span>Item Name</span>
          </TableHeaderCell>
        </TableHeaderRow>
      }
    >
      {data.map((x) => {
        return (
          <TableRow rowKey={x.ItemCode}>
            <TableCell>
              <span>{x.ItemCode}</span>
            </TableCell>
            <TableCell>
              <span>{x.ItemName}</span>
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
};
