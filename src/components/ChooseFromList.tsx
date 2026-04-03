import { useState } from "react";
import {
  Bar,
  BusyIndicator,
  Button,
  CheckBox,
  Dialog,
  FlexBox,
  Input,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";

export type CflColumn<T> = {
  key: keyof T & string;
  label: string;
  render?: (value: unknown) => string;
};

type SingleSelectProps<T> = {
  multiSelect?: false;
  onSelect: (row: T) => void;
};

type MultiSelectProps<T> = {
  multiSelect: true;
  onSelect: (rows: T[]) => void;
};

type Props<T> = {
  open: boolean;
  title: string;
  columns: CflColumn<T>[];
  data: T[];
  totalCount: number;
  isLoading?: boolean;
  page: number;
  search: string;
  onPageChange: (page: number) => void;
  onSearchChange: (search: string) => void;
  onClose: () => void;
} & (SingleSelectProps<T> | MultiSelectProps<T>);

const PAGE_SIZE = 10;

export function ChooseFromList<T>({
  open,
  title,
  columns,
  data,
  totalCount,
  isLoading,
  page,
  search,
  onPageChange,
  onSearchChange,
  onSelect,
  onClose,
  multiSelect,
}: Props<T>) {
  const [checkedRows, setCheckedRows] = useState<T[]>([]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function isChecked(row: T) {
    return checkedRows.some((r) => JSON.stringify(r) === JSON.stringify(row));
  }

  function toggleRow(row: T) {
    setCheckedRows((prev) =>
      isChecked(row)
        ? prev.filter((r) => JSON.stringify(r) !== JSON.stringify(row))
        : [...prev, row]
    );
  }

  function handleSingleSelect(row: T) {
    (onSelect as (row: T) => void)(row);
    onClose();
  }

  function handleConfirm() {
    (onSelect as (rows: T[]) => void)(checkedRows);
    setCheckedRows([]);
    onClose();
  }

  function handleClose() {
    setCheckedRows([]);
    onClose();
  }

  return (
    <Dialog
      open={open}
      headerText={title}
      onClose={handleClose}
      footer={
        <Bar
          startContent={
            <FlexBox alignItems="Center" style={{ gap: "0.5rem" }}>
              <Button disabled={page === 0} onClick={() => onPageChange(page - 1)}>
                &lt; Prev
              </Button>
              <span style={{ fontSize: "0.875rem" }}>
                {page + 1} / {totalPages}
              </span>
              <Button disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
                Next &gt;
              </Button>
            </FlexBox>
          }
          endContent={
            <FlexBox style={{ gap: "0.5rem" }}>
              {multiSelect && (
                <Button design="Emphasized" disabled={checkedRows.length === 0} onClick={handleConfirm}>
                  Confirm ({checkedRows.length})
                </Button>
              )}
              <Button onClick={handleClose}>Cancel</Button>
            </FlexBox>
          }
        />
      }
      style={{ minWidth: "480px" }}
    >
      <Input
        placeholder="Search..."
        value={search}
        onInput={(e) => {
          onSearchChange((e.target as HTMLInputElement).value);
          onPageChange(0);
        }}
        style={{ width: "100%", marginBottom: "0.5rem" }}
      />
      {isLoading ? (
        <FlexBox justifyContent="Center" style={{ padding: "2rem" }}>
          <BusyIndicator active />
        </FlexBox>
      ) : (
        <Table
          headerRow={
            <TableHeaderRow>
              {multiSelect && <TableHeaderCell />}
              {columns.map((col) => (
                <TableHeaderCell key={col.key}>
                  <span>{col.label}</span>
                </TableHeaderCell>
              ))}
              {!multiSelect && <TableHeaderCell />}
            </TableHeaderRow>
          }
        >
          {data.map((row, i) => (
            <TableRow key={i} rowKey={String(i)}>
              {multiSelect && (
                <TableCell>
                  <CheckBox checked={isChecked(row)} onChange={() => toggleRow(row)} />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell key={col.key}>
                  <span>{col.render ? col.render((row as Record<string, unknown>)[col.key]) : String((row as Record<string, unknown>)[col.key] ?? "")}</span>
                </TableCell>
              ))}
              {!multiSelect && (
                <TableCell>
                  <Button onClick={() => handleSingleSelect(row)}>Select</Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </Table>
      )}
    </Dialog>
  );
}
