import { useState } from "react";
import { FlexBox, Form, FormItem, Icon, Input, Label } from "@ui5/webcomponents-react";
import { ChooseFromList } from "../components";
import { useSalesOrder } from "../hooks";
import type { SalesOrder } from "../api";

export const DemoScreen2: React.FC = () => {
  // ========== STATE
  const [cflOpen, setCflOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  // ========== HOOKS
  const { data, isPending } = useSalesOrder({ page, search });

  // ========== VIEWS
  return (
    <FlexBox direction="Column" style={{ padding: "1rem" }}>
      <Form layout="S1 M2 L2 XL2" labelSpan="S12 M4 L4 XL4" style={{ maxWidth: "900px" }}>
        <FormItem labelContent={<Label slot="label">Doc No.</Label>}>
          <Input value={selectedOrder ? String(selectedOrder.DocNum) : ""} readonly>
            <Icon slot="icon" name="value-help" style={{ cursor: "pointer" }} onClick={() => setCflOpen(true)} />
          </Input>
        </FormItem>

        <FormItem labelContent={<Label slot="label">Customer</Label>}>
          <Input value={selectedOrder?.CardName ?? ""} readonly />
        </FormItem>

        <FormItem labelContent={<Label slot="label">Doc Date</Label>}>
          <Input value={selectedOrder?.DocDate ?? ""} readonly />
        </FormItem>

        <FormItem labelContent={<Label slot="label">Doc Total</Label>}>
          <Input value={selectedOrder ? String(selectedOrder.DocTotal) : ""} readonly />
        </FormItem>
      </Form>

      <ChooseFromList<SalesOrder>
        open={cflOpen}
        title="Select Sales Order"
        columns={[
          { key: "DocNum", label: "Doc No." },
          { key: "CardCode", label: "Customer Code" },
          { key: "CardName", label: "Customer Name" },
          { key: "DocDate", label: "Doc Date" },
        ]}
        data={data?.value ?? []}
        totalCount={data?.count ?? 0}
        isLoading={isPending}
        page={page}
        search={search}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onSelect={setSelectedOrder}
        onClose={() => setCflOpen(false)}
      />
    </FlexBox>
  );
};
