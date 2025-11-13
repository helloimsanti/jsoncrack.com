import React from "react";
import type { ModalProps } from "@mantine/core";
import { Modal, Stack, Text, Textarea, Button, Alert, Group, Badge, Divider } from "@mantine/core";
import { MdError, MdCheck } from "react-icons/md";
import styled from "styled-components";
import type { NodeData } from "../../../types/graph";
import useGraph from "../../editor/views/GraphView/stores/useGraph";
import useJson from "../../../store/useJson";

const updateJsonAtPath = (json: any, path: (string | number)[], value: any): any => {
  if (!path || path.length === 0) return value;

  const [head, ...tail] = path;
  
  if (tail.length === 0) {
    if (Array.isArray(json)) {
      const newArr = [...json];
      newArr[head as number] = value;
      return newArr;
    } else {
      return { ...json, [head]: value };
    }
  }

  if (Array.isArray(json)) {
    const newArr = [...json];
    newArr[head as number] = updateJsonAtPath(json[head as number], tail as (string | number)[], value);
    return newArr;
  } else {
    return { ...json, [head]: updateJsonAtPath(json[head], tail as (string | number)[], value) };
  }
};

const parseValue = (valueStr: string): any => {
  // Try to parse as JSON first (handles numbers, booleans, null, objects, arrays)
  try {
    return JSON.parse(valueStr);
  } catch {
    // If not valid JSON, treat as string
    return valueStr;
  }
};

const StyledEditContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledKeyValueDisplay = styled.div`
  background: ${({ theme }) => theme.GRID_BG_COLOR || "#f5f5f5"};
  padding: 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 13px;
  border: 1px solid ${({ theme }) => theme.GRID_COLOR_PRIMARY || "#e0e0e0"};
`;

const StyledLabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const EditNodeModal = ({ opened, onClose }: ModalProps) => {
  const nodeData = useGraph(state => state.selectedNode);
  const json = useJson(state => state.json);
  const setJson = useJson(state => state.setJson);
  const [inputValue, setInputValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    if (opened && nodeData && nodeData.text[0]) {
      setInputValue(JSON.stringify(nodeData.text[0].value));
      setError(null);
      setIsEditing(false);
    }
  }, [opened, nodeData]);

  const handleSave = () => {
    try {
      setError(null);
      
      if (!nodeData || !nodeData.path) {
        setError("Unable to determine node path");
        return;
      }

      const parsedValue = parseValue(inputValue);
      const currentJson = JSON.parse(json);
      const updatedJson = updateJsonAtPath(currentJson, nodeData.path as (string | number)[], parsedValue);
      
      setJson(JSON.stringify(updatedJson));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update value");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSave();
    }
    if (e.key === "Escape") {
      if (isEditing) {
        setIsEditing(false);
        setError(null);
      } else {
        onClose();
      }
    }
  };

  return (
    <Modal size="lg" opened={opened} onClose={onClose} centered title="Node Details" withCloseButton>
      <StyledEditContainer>
        {nodeData && nodeData.text[0] && (
          <>
            <StyledLabelRow>
              <Text fz="sm" fw={600}>
                {nodeData.text[0].key ? "Property" : "Value"}
              </Text>
              {isEditing && (
                <Badge color="blue" variant="light">
                  Editing
                </Badge>
              )}
            </StyledLabelRow>

            <StyledKeyValueDisplay>
              <div>
                {nodeData.text[0].key && (
                  <div style={{ marginBottom: "6px", color: "#666" }}>
                    <strong>Key:</strong> {nodeData.text[0].key}
                  </div>
                )}
                <div style={{ color: "#333" }}>
                  <strong>Current Value:</strong>
                  <div style={{ marginTop: "4px", paddingLeft: "8px", color: "#555" }}>
                    {JSON.stringify(nodeData.text[0].value)}
                  </div>
                </div>
              </div>
            </StyledKeyValueDisplay>

            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} fullWidth>
                Edit Value
              </Button>
            ) : (
              <>
                <Divider my="xs" />
                
                <div>
                  <Text fz="sm" fw={500} mb="xs">
                    New Value
                  </Text>
                  <Textarea
                    placeholder="Enter new value"
                    value={inputValue}
                    onChange={e => setInputValue(e.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    minRows={4}
                    maxRows={10}
                    error={error}
                  />
                </div>

                {error && (
                  <Alert icon={<MdError size={16} />} color="red" title="Error">
                    {error}
                  </Alert>
                )}

                <Text fz="xs" c="dimmed">
                  Tip: Use Ctrl+Enter to save, or Escape to cancel
                </Text>

                <Group justify="flex-end" gap="sm">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} leftSection={<MdCheck size={16} />}>
                    Save Changes
                  </Button>
                </Group>
              </>
            )}
          </>
        )}
      </StyledEditContainer>
    </Modal>
  );
};
