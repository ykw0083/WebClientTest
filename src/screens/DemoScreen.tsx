import { useState } from "react";
import {
  Bar,
  BusyIndicator,
  Button,
  FlexBox,
  Input,
  Table,
  TableCell,
  TableHeaderCell,
  TableHeaderRow,
  TableRow,
} from "@ui5/webcomponents-react";
import { useBusinessPartner } from "../hooks";

const PAGE_SIZE = 10;

export const DemoScreen: React.FC = () => {
  // ========== STATE
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  // ========== HOOKS
  const { data, isPending } = useBusinessPartner({ page, search });

  const totalPages = Math.max(1, Math.ceil((data?.count ?? 0) / PAGE_SIZE));

  // ========== VIEWS
  return (
    <FlexBox direction="Column" style={{ padding: "1rem", gap: "0.5rem" }}>
      <Bar
        startContent={
          <Input
            placeholder="Search..."
            value={search}
            onInput={(e) => {
              setSearch((e.target as HTMLInputElement).value);
              setPage(0);
            }}
          />
        }
        endContent={
          <FlexBox alignItems="Center" style={{ gap: "0.5rem" }}>
            <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              &lt; Prev
            </Button>
            <span style={{ fontSize: "0.875rem" }}>
              {page + 1} / {totalPages}
            </span>
            <Button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next &gt;
            </Button>
          </FlexBox>
        }
      />

      {isPending ? (
        <FlexBox justifyContent="Center" style={{ padding: "2rem" }}>
          <BusyIndicator active />
        </FlexBox>
      ) : (
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
          {(data?.value ?? []).map((x) => (
            <TableRow rowKey={x.CardCode}>
              <TableCell>
                <span>{x.CardCode}</span>
              </TableCell>
              <TableCell>
                <span>{x.CardName}</span>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </FlexBox>
  );
};
