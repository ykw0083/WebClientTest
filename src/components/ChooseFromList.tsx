import {
  Bar,
  BusyIndicator,
  Button,
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
  onSelect: (row: T) => void;
  onClose: () => void;
};

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
}: Props<T>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function handleSelect(row: T) {
    onSelect(row);
    onClose();
  }

  return (
    <Dialog
      open={open}
      headerText={title}
      onClose={onClose}
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
              <Button
                disabled={page >= totalPages - 1}
                onClick={() => onPageChange(page + 1)}
              >
                Next &gt;
              </Button>
            </FlexBox>
          }
          endContent={<Button onClick={onClose}>Cancel</Button>}
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
              {columns.map((col) => (
                <TableHeaderCell key={col.key}>
                  <span>{col.label}</span>
                </TableHeaderCell>
              ))}
              <TableHeaderCell />
            </TableHeaderRow>
          }
        >
          {data.map((row, i) => (
            <TableRow key={i} rowKey={String(i)}>
              {columns.map((col) => (
                <TableCell key={col.key}>
                  <span>{String((row as Record<string, unknown>)[col.key] ?? "")}</span>
                </TableCell>
              ))}
              <TableCell>
                <Button onClick={() => handleSelect(row)}>Select</Button>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </Dialog>
  );
}
