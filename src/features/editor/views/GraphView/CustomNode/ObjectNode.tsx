import React from "react";
import styled from "styled-components";
import { MdEdit } from "react-icons/md";
import type { CustomNodeProps } from ".";
import { NODE_DIMENSIONS } from "../../../../../constants/graph";
import type { NodeData } from "../../../../../types/graph";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";
import { useModal } from "../../../../../store/useModal";
import useGraph from "../stores/useGraph";

const StyledEditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.INTERACTIVE_NORMAL};
  opacity: 0;
  transition: opacity 0.2s ease, color 0.2s ease;
  margin-left: auto;
  pointer-events: all;

  &:hover {
    color: ${({ theme }) => theme.INTERACTIVE_HOVER};
  }

  &:active {
    color: ${({ theme }) => theme.INTERACTIVE_ACTIVE};
  }

  svg {
    width: 14px;
    height: 14px;
  }
`;

const StyledRowContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  &:hover ${StyledEditButton} {
    opacity: 1;
  }
`;

type RowProps = {
  row: NodeData["text"][number];
  x: number;
  y: number;
  index: number;
  nodeId: string;
  nodePath?: (string | number)[];
};

const Row = ({ row, x, y, index, nodeId, nodePath }: RowProps) => {
  const rowPosition = index * NODE_DIMENSIONS.ROW_HEIGHT;
  const setSelectedNode = useGraph(state => state.setSelectedNode);
  const setVisible = useModal(state => state.setVisible);

  const getRowText = () => {
    if (row.type === "object") return `{${row.childrenCount ?? 0} keys}`;
    if (row.type === "array") return `[${row.childrenCount ?? 0} items]`;
    return row.value;
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setSelectedNode) {
      setSelectedNode({
        id: nodeId,
        text: [row],
        width: 0,
        height: 0,
        path: nodePath,
      } as NodeData);
    }
    setVisible("EditNodeModal", true);
  };

  // Don't show edit button for containers
  const isContainer = row.type === "object" || row.type === "array";

  return (
    <Styled.StyledRow
      $value={row.value}
      data-key={`${row.key}: ${row.value}`}
      data-x={x}
      data-y={y + rowPosition}
    >
      <StyledRowContent>
        <div style={{ flex: 1, overflow: "hidden" }}>
          <Styled.StyledKey $type="object">{row.key}: </Styled.StyledKey>
          <TextRenderer>{getRowText()}</TextRenderer>
        </div>
        {!isContainer && (
          <StyledEditButton onClick={handleEditClick} title="Edit value">
            <MdEdit />
          </StyledEditButton>
        )}
      </StyledRowContent>
    </Styled.StyledRow>
  );
};

const Node = ({ node, x, y }: CustomNodeProps) => (
  <Styled.StyledForeignObject
    data-id={`node-${node.id}`}
    width={node.width}
    height={node.height}
    x={0}
    y={0}
    $isObject
  >
    {node.text.map((row, index) => (
      <Row key={`${node.id}-${index}`} row={row} x={x} y={y} index={index} nodeId={node.id} nodePath={node.path} />
    ))}
  </Styled.StyledForeignObject>
);

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return (
    JSON.stringify(prev.node.text) === JSON.stringify(next.node.text) &&
    prev.node.width === next.node.width
  );
}

export const ObjectNode = React.memo(Node, propsAreEqual);
