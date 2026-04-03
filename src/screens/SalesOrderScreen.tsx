import { useState } from "react";
import {
  Bar,
  Button,
  FlexBox,
  Form,
  FormItem,
  Icon,
  Input,
  Label,
  Modals,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
  Title,
} from "@ui5/webcomponents-react";
import { ChooseFromList } from "../components";
import { useBusinessPartner, useCreateSalesOrder, useItemMaster } from "../hooks";
import type { BusinessPartner, ItemMaster } from "../api";

type OrderLine = {
  itemCode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
};

const emptyLine = (): OrderLine => ({
  itemCode: "",
  itemName: "",
  quantity: 1,
  unitPrice: 0,
});

const today = () => new Date().toISOString().split("T")[0];

export const SalesOrderScreen: React.FC = () => {
  // ========== STATE — Header
  const [docDate, setDocDate] = useState(today);
  const [docDueDate, setDocDueDate] = useState(today);
  const [customer, setCustomer] = useState<BusinessPartner | null>(null);

  // ========== STATE — Lines
  const [lines, setLines] = useState<OrderLine[]>([emptyLine()]);
  const [editingLineIndex, setEditingLineIndex] = useState<number | null>(null);

  // ========== STATE — Validation
  const [errors, setErrors] = useState<string[]>([]);

  // ========== STATE — BP CFL
  const [bpCflOpen, setBpCflOpen] = useState(false);
  const [bpPage, setBpPage] = useState(0);
  const [bpSearch, setBpSearch] = useState("");

  // ========== STATE — Item CFL
  const [itemCflOpen, setItemCflOpen] = useState(false);
  const [itemPage, setItemPage] = useState(0);
  const [itemSearch, setItemSearch] = useState("");

  // ========== HOOKS
  const { data: bpData, isPending: bpLoading } = useBusinessPartner({ page: bpPage, search: bpSearch });
  const { data: itemData, isPending: itemLoading } = useItemMaster({ page: itemPage, search: itemSearch });
  const { mutate: createOrder, isPending: isSubmitting } = useCreateSalesOrder((docNum) => {
    Modals.showMessageBox({
      type: "Confirm",
      children: `Sales Order ${docNum} created successfully.`,
    });
    resetForm();
  });

  // ========== HANDLERS
  function resetForm() {
    setDocDate(today());
    setDocDueDate(today());
    setCustomer(null);
    setLines([emptyLine()]);
    setErrors([]);
  }

  function openItemCfl(index: number) {
    setEditingLineIndex(index);
    setItemCflOpen(true);
  }

  function handleSelectItems(items: ItemMaster[]) {
    const newLines = items.map((item) => ({
      ...emptyLine(),
      itemCode: item.ItemCode,
      itemName: item.ItemName,
    }));
    setLines((prev) => {
      const updated = [...prev];
      if (editingLineIndex !== null && !updated[editingLineIndex].itemCode) {
        updated.splice(editingLineIndex, 1, ...newLines);
      } else {
        updated.push(...newLines);
      }
      return updated;
    });
    setEditingLineIndex(null);
  }

  function updateLine(index: number, field: keyof OrderLine, value: string) {
    setLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? { ...line, [field]: field === "quantity" || field === "unitPrice" ? Number(value) : value }
          : line
      )
    );
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!customer) errs.push("Please select a Business Partner.");
    const validLines = lines.filter((l) => l.itemCode);
    if (validLines.length === 0) errs.push("Please add at least one item line.");
    if (validLines.some((l) => l.quantity <= 0)) errs.push("All lines must have quantity greater than 0.");
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    createOrder({
      CardCode: customer!.CardCode,
      DocDate: docDate,
      DocDueDate: docDueDate,
      DocumentLines: lines
        .filter((l) => l.itemCode)
        .map((l) => ({
          ItemCode: l.itemCode,
          Quantity: l.quantity,
          UnitPrice: l.unitPrice,
        })),
    });
  }

  const docTotal = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  // ========== VIEWS
  return (
    <FlexBox direction="Column" style={{ padding: "1rem", gap: "1rem" }}>
      <Title>New Sales Order</Title>

      {/* Header */}
      <Form layout="S1 M2 L2 XL2" labelSpan="S12 M4 L4 XL4" style={{ maxWidth: "900px" }}>
        <FormItem labelContent={<Label slot="label">Doc Date</Label>}>
          <Input
            type="Date"
            value={docDate}
            onInput={(e) => setDocDate((e.target as HTMLInputElement).value)}
          />
        </FormItem>

        <FormItem labelContent={<Label slot="label">Due Date</Label>}>
          <Input
            type="Date"
            value={docDueDate}
            onInput={(e) => setDocDueDate((e.target as HTMLInputElement).value)}
          />
        </FormItem>

        <FormItem labelContent={<Label slot="label">BP Code</Label>}>
          <Input value={customer?.CardCode ?? ""} readonly>
            <Icon slot="icon" name="value-help" style={{ cursor: "pointer" }} onClick={() => setBpCflOpen(true)} />
          </Input>
        </FormItem>

        <FormItem labelContent={<Label slot="label">BP Name</Label>}>
          <Input value={customer?.CardName ?? ""} readonly />
        </FormItem>
      </Form>

      {/* Lines */}
      <Bar
        startContent={<Title level="H5">Order Lines</Title>}
        endContent={<Button icon="add" onClick={addLine}>Add Line</Button>}
      />
      <Table
        headerRow={
          <TableHeaderRow>
            <TableHeaderCell><span>Item Code</span></TableHeaderCell>
            <TableHeaderCell><span>Item Name</span></TableHeaderCell>
            <TableHeaderCell><span>Quantity</span></TableHeaderCell>
            <TableHeaderCell><span>Unit Price</span></TableHeaderCell>
            <TableHeaderCell><span>Line Total</span></TableHeaderCell>
            <TableHeaderCell />
          </TableHeaderRow>
        }
      >
        {lines.map((line, i) => (
          <TableRow key={i} rowKey={String(i)}>
            <TableCell>
              <Input value={line.itemCode} readonly>
                <Icon slot="icon" name="value-help" style={{ cursor: "pointer" }} onClick={() => openItemCfl(i)} />
              </Input>
            </TableCell>
            <TableCell>
              <Input value={line.itemName} readonly />
            </TableCell>
            <TableCell>
              <Input
                type="Number"
                value={String(line.quantity)}
                onInput={(e) => updateLine(i, "quantity", (e.target as HTMLInputElement).value)}
              />
            </TableCell>
            <TableCell>
              <Input
                type="Number"
                value={String(line.unitPrice)}
                onInput={(e) => updateLine(i, "unitPrice", (e.target as HTMLInputElement).value)}
              />
            </TableCell>
            <TableCell>
              <span>{(line.quantity * line.unitPrice).toFixed(2)}</span>
            </TableCell>
            <TableCell>
              <Button icon="decline" design="Transparent" onClick={() => removeLine(i)} />
            </TableCell>
          </TableRow>
        ))}
      </Table>

      {/* Validation errors */}
      {errors.length > 0 && (
        <FlexBox direction="Column" style={{ gap: "0.25rem" }}>
          {errors.map((err, i) => (
            <Label key={i} style={{ color: "var(--sapErrorColor)" }}>{err}</Label>
          ))}
        </FlexBox>
      )}

      {/* Footer */}
      <Bar
        style={{ maxWidth: "900px" }}
        startContent={<Label>Doc Total: {docTotal.toFixed(2)}</Label>}
        endContent={
          <Button design="Emphasized" icon="save" loading={isSubmitting} onClick={handleSubmit}>
            Add
          </Button>
        }
      />

      {/* BP CFL */}
      <ChooseFromList<BusinessPartner>
        open={bpCflOpen}
        title="Select Business Partner"
        columns={[
          { key: "CardCode", label: "BP Code" },
          { key: "CardName", label: "BP Name" },
        ]}
        data={bpData?.value ?? []}
        totalCount={bpData?.count ?? 0}
        isLoading={bpLoading}
        page={bpPage}
        search={bpSearch}
        onPageChange={setBpPage}
        onSearchChange={setBpSearch}
        onSelect={setCustomer}
        onClose={() => setBpCflOpen(false)}
      />

      {/* Item CFL */}
      <ChooseFromList<ItemMaster>
        open={itemCflOpen}
        title="Select Item"
        columns={[
          { key: "ItemCode", label: "Item Code" },
          { key: "ItemName", label: "Item Name" },
        ]}
        data={itemData?.value ?? []}
        totalCount={itemData?.count ?? 0}
        isLoading={itemLoading}
        page={itemPage}
        search={itemSearch}
        onPageChange={setItemPage}
        onSearchChange={setItemSearch}
        multiSelect
        onSelect={handleSelectItems}
        onClose={() => { setItemCflOpen(false); setEditingLineIndex(null); }}
      />
    </FlexBox>
  );
};
