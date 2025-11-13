import React from "react";
import styled from "styled-components";
import { MdEdit } from "react-icons/md";
import type { CustomNodeProps } from ".";
import useConfig from "../../../../../store/useConfig";
import { isContentImage } from "../lib/utils/calculateNodeSize";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";
import { useModal } from "../../../../../store/useModal";
import useGraph from "../stores/useGraph";

const StyledTextNodeWrapper = styled.span<{ $isParent: boolean }>`
  display: flex;
  justify-content: ${({ $isParent }) => ($isParent ? "center" : "flex-start")};
  align-items: center;
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 0 10px;
  gap: 8px;
`;

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
  flex-shrink: 0;
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

  foreignobject:hover & {
    opacity: 1;
  }
`;

const StyledNodeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  gap: 4px;

  &:hover ${StyledEditButton} {
    opacity: 1;
  }
`;

const StyledImageWrapper = styled.div`
  padding: 5px;
`;

const StyledImage = styled.img`
  border-radius: 2px;
  object-fit: contain;
  background: ${({ theme }) => theme.BACKGROUND_MODIFIER_ACCENT};
`;

const Node = ({ node, x, y }: CustomNodeProps) => {
  const { text, width, height } = node;
  const imagePreviewEnabled = useConfig(state => state.imagePreviewEnabled);
  const isImage = imagePreviewEnabled && isContentImage(JSON.stringify(text[0].value));
  const value = text[0].value;
  const setSelectedNode = useGraph(state => state.setSelectedNode);
  const setVisible = useModal(state => state.setVisible);

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setSelectedNode) setSelectedNode(node);
    setVisible("EditNodeModal", true);
  };

  return (
    <Styled.StyledForeignObject
      data-id={`node-${node.id}`}
      width={width}
      height={height}
      x={0}
      y={0}
    >
      {isImage ? (
        <StyledImageWrapper>
          <StyledImage src={JSON.stringify(text[0].value)} width="70" height="70" loading="lazy" />
        </StyledImageWrapper>
      ) : (
        <StyledNodeContainer>
          <StyledTextNodeWrapper
            data-x={x}
            data-y={y}
            data-key={JSON.stringify(text)}
            $isParent={false}
          >
            <Styled.StyledKey $value={value} $type={typeof text[0].value}>
              <TextRenderer>{value}</TextRenderer>
            </Styled.StyledKey>
          </StyledTextNodeWrapper>
          <StyledEditButton onClick={handleEditClick} title="Edit value">
            <MdEdit />
          </StyledEditButton>
        </StyledNodeContainer>
      )}
    </Styled.StyledForeignObject>
  );
};

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return prev.node.text === next.node.text && prev.node.width === next.node.width;
}

export const TextNode = React.memo(Node, propsAreEqual);
