import { useState } from "react";
import {
  Bar,
  BusyIndicator,
  FlexBox,
  Form,
  FormItem,
  Icon,
  Input,
  Label,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  Title,
} from "@ui5/webcomponents-react";
import { ChooseFromList } from "../components";
import { useSalesOrder, useSalesOrderDetail } from "../hooks";
import type { SalesOrder } from "../api";

const formatDate = (v: unknown) => String(v).split("T")[0];

export const DemoScreen2: React.FC = () => {
  // ========== STATE
  const [cflOpen, setCflOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedDocEntry, setSelectedDocEntry] = useState<number | null>(null);

  // ========== HOOKS
  const { data: cflData, isPending: cflLoading } = useSalesOrder({ page, search });
  const { data: order, isPending: orderLoading } = useSalesOrderDetail(selectedDocEntry);

  // ========== VIEWS
  return (
    <FlexBox direction="Column" style={{ padding: "1rem", gap: "1rem" }}>
      <Title>Sales Order</Title>

      {/* Header */}
      <Form layout="S1 M2 L2 XL2" labelSpan="S12 M4 L4 XL4" style={{ maxWidth: "auto" }}>
        <FormItem labelContent={<Label slot="label">Doc No.</Label>}>
          <Input value={order ? String(order.DocNum) : ""} readonly>
            <Icon slot="icon" name="value-help" style={{ cursor: "pointer" }} onClick={() => setCflOpen(true)} />
          </Input>
        </FormItem>

        <FormItem labelContent={<Label slot="label">Doc Date</Label>}>
          <Input value={order?.DocDate ? formatDate(order.DocDate) : ""} readonly />
        </FormItem>

        <FormItem labelContent={<Label slot="label">Due Date</Label>}>
          <Input value={order?.DocDueDate ? formatDate(order.DocDueDate) : ""} readonly />
        </FormItem>

        <FormItem labelContent={<Label slot="label">BP Code</Label>}>
          <Input value={order?.CardCode ?? ""} readonly />
        </FormItem>

        <FormItem labelContent={<Label slot="label">BP Name</Label>}>
          <Input value={order?.CardName ?? ""} readonly />
        </FormItem>
      </Form>

      {/* Lines */}
      <Bar startContent={<Title level="H5">Order Lines</Title>} />
      {orderLoading ? (
        <FlexBox justifyContent="Center" style={{ padding: "2rem" }}>
          <BusyIndicator active />
        </FlexBox>
      ) : (
        <Table
          headerRow={
            <TableHeaderRow>
              <TableHeaderCell><span>Item Code</span></TableHeaderCell>
              <TableHeaderCell><span>Item Name</span></TableHeaderCell>
              <TableHeaderCell><span>Quantity</span></TableHeaderCell>
              <TableHeaderCell><span>Unit Price</span></TableHeaderCell>
              <TableHeaderCell><span>Line Total</span></TableHeaderCell>
            </TableHeaderRow>
          }
        >
          {(order?.DocumentLines ?? []).map((line, i) => (
            <TableRow key={i} rowKey={String(i)}>
              <TableCell><span>{line.ItemCode}</span></TableCell>
              <TableCell><span>{line.ItemDescription}</span></TableCell>
              <TableCell><span>{line.Quantity}</span></TableCell>
              <TableCell><span>{line.UnitPrice}</span></TableCell>
              <TableCell><span>{line.LineTotal}</span></TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Doc Total */}
      <FlexBox justifyContent="End" style={{ maxWidth: "auto" }}>
        <Label>Doc Total: {order?.DocTotal ?? ""}</Label>
      </FlexBox>

      {/* CFL */}
      <ChooseFromList<SalesOrder>
        open={cflOpen}
        title="Select Sales Order"
        columns={[
          { key: "DocNum", label: "Doc No." },
          { key: "CardCode", label: "BP Code" },
          { key: "CardName", label: "BP Name" },
          { key: "DocDate", label: "Doc Date", render: formatDate },
          { key: "DocDueDate", label: "Due Date", render: formatDate },
          { key: "DocTotal", label: "Doc Total" },
        ]}
        data={cflData?.value ?? []}
        totalCount={cflData?.count ?? 0}
        isLoading={cflLoading}
        page={page}
        search={search}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onSelect={(row) => setSelectedDocEntry(row.DocEntry)}
        onClose={() => setCflOpen(false)}
      />
    </FlexBox>
  );
};
