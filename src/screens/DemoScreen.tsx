import {
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";
import { useBusinessPartner } from "../hooks";
import { Loader } from "../components";

export const DemoScreen: React.FC = () => {
  // ========== HOOKS
  const { data = [], isPending } = useBusinessPartner();

  // ========== VIEWS
  if (isPending) {
    return <Loader />;
  }

  return (
    <Table
      headerRow={
        <TableHeaderRow sticky>
          <TableHeaderCell>
            <span>Customer Code</span>
          </TableHeaderCell>
          <TableHeaderCell>
            <span>Customer Name</span>
          </TableHeaderCell>
        </TableHeaderRow>
      }
    >
      {data.map((x) => {
        return (
          <TableRow rowKey={x.CardCode}>
            <TableCell>
              <span>{x.CardCode}</span>
            </TableCell>
            <TableCell>
              <span>{x.CardName}</span>
            </TableCell>
          </TableRow>
        );
      })}
    </Table>
  );
};
