import React, { useState } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import {
  DataTable,
  DataTableCellProps,
  DataTableHeaderProps,
  DataTablePaginationProps,
  DataTableProps,
  DataTableRowProps,
  DataTableTitleProps,
} from 'react-native-paper';

interface TableComponentProps extends DataTableProps {
  children: React.ReactNode;
}

const TableComponent = ({ children, ...props }: TableComponentProps) => {
  return <DataTable {...props}>{children}</DataTable>;
};

interface TableHeaderProps extends DataTableHeaderProps {
  children: React.ReactNode;
}

const TableHeader = ({ children, ...props }: TableHeaderProps) => {
  return <DataTable.Header {...props}>{children}</DataTable.Header>;
};

interface TableRowProps extends DataTableRowProps {
  children: any;
  onPress?: () => void;
  key?: any;
}

const TableRow = ({ children, key, onPress, ...props }: TableRowProps) => {
  return (
    <DataTable.Row key={key} onPress={onPress} {...props}>
      {children}
    </DataTable.Row>
  );
};

interface TableCellProps extends DataTableCellProps {
  children: any;
  numeric?: boolean;
  onPress?: () => void;
  textStyle?: StyleProp<TextStyle>;
  maxFontSizeMultiplier?: number;
}

const TableCell = ({
  children,
  numeric,
  onPress,
  textStyle,
  maxFontSizeMultiplier,
  ...props
}: TableCellProps) => {
  return (
    <DataTable.Cell
      numeric={numeric}
      onPress={onPress}
      textStyle={textStyle}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      {...props}
    >
      {children}
    </DataTable.Cell>
  );
};

interface TablePaginationProps {
  items: any;
  page: number;
  numberOfItemsPerPage?: number;
  from?: number;
  to?: number;
}

const TablePagination = ({
  items,
  page,
  numberOfItemsPerPage = 5,
  from = 1,
  to = 1,
}: TablePaginationProps) => {
  const [pages, setPages] = useState(page);
  React.useEffect(() => {
    setPages(0);
  }, [numberOfItemsPerPage]);
  return (
    <DataTable.Pagination
      page={pages}
      numberOfPages={Math.ceil(items.length / numberOfItemsPerPage)}
      onPageChange={(page) => setPages(page)}
      label={`${from + 1}-${to} of ${items.length}`}
      showFastPaginationControls
    />
  );
};

interface TableTitleProps extends DataTableTitleProps {
  numeric?: boolean;
  children: any;
  numberOfLines?: number;
  onPress?: () => void;
  textStyle?: StyleProp<TextStyle>;
  sortDirection?: 'ascending' | 'descending';
}

const TableTitle = ({ children, onPress, ...props }: TableTitleProps) => {
  return (
    <DataTable.Title {...props} onPress={onPress}>
      {children}
    </DataTable.Title>
  );
};

TableComponent.Header = TableHeader;
TableComponent.Row = TableRow;
TableComponent.Cell = TableCell;
TableComponent.Pagination = TablePagination;
TableComponent.Title = TableTitle;

export default TableComponent;
