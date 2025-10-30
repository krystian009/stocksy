import * as React from "react";

import { cn } from "@/lib/utils";

const Table = React.forwardRef<HTMLTableElement, React.ComponentPropsWithoutRef<"table">>((props, ref) => {
  const { className, ...rest } = props;
  return <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...rest} />;
});
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"thead">>((props, ref) => {
  const { className, ...rest } = props;
  return <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...rest} />;
});
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"tbody">>((props, ref) => {
  const { className, ...rest } = props;
  return <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...rest} />;
});
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.ComponentPropsWithoutRef<"tfoot">>((props, ref) => {
  const { className, ...rest } = props;
  return <tfoot ref={ref} className={cn("bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...rest} />;
});
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.ComponentPropsWithoutRef<"tr">>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <tr
      ref={ref}
      className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)}
      {...rest}
    />
  );
});
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<"th">>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <th
      ref={ref}
      className={cn("h-10 px-2 sm:px-3 text-left align-middle font-medium text-muted-foreground", className)}
      {...rest}
    />
  );
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.ComponentPropsWithoutRef<"td">>((props, ref) => {
  const { className, ...rest } = props;
  return <td ref={ref} className={cn("p-2 sm:p-3 align-middle", className)} {...rest} />;
});
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.ComponentPropsWithoutRef<"caption">>(
  (props, ref) => {
    const { className, ...rest } = props;
    return <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...rest} />;
  }
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
