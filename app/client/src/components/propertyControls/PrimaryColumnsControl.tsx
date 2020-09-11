import React from "react";
import BaseControl, { ControlProps } from "./BaseControl";
import {
  StyledInputGroup,
  StyledDragIcon,
  StyledEditIcon,
  StyledVisibleIcon,
} from "./StyledControls";
import styled from "constants/DefaultTheme";
import { DroppableComponent } from "../designSystems/appsmith/DraggableListComponent";
import { ColumnProperties } from "widgets/TableWidget";

const ItemWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const TabsWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const StyledOptionControlInputGroup = styled(StyledInputGroup)`
  margin-right: 2px;
  width: 100%;
  &&& {
    input {
      border: none;
      color: ${props => props.theme.colors.textOnDarkBG};
      background: ${props => props.theme.colors.paneInputBG};
      &:focus {
        border: none;
        color: ${props => props.theme.colors.textOnDarkBG};
        background: ${props => props.theme.colors.paneInputBG};
      }
    }
  }
`;

type RenderComponentProps = {
  index: number;
  item: {
    label: string;
  };
  updateOption: (index: number, value: string) => void;
  onEdit?: (index: number) => void;
  deleteOption: (index: number) => void;
};

function ColumnControlComponent(props: RenderComponentProps) {
  const { updateOption, onEdit, item, deleteOption, index } = props;
  return (
    <ItemWrapper>
      <StyledDragIcon height={20} width={20} />
      <StyledOptionControlInputGroup
        type="text"
        placeholder="Column Title"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          updateOption(index, event.target.value);
        }}
        defaultValue={item.label}
      />
      <StyledVisibleIcon
        height={20}
        width={20}
        onClick={() => {
          deleteOption && deleteOption(index);
        }}
      />
      <StyledEditIcon
        height={20}
        width={20}
        onClick={() => {
          onEdit && onEdit(index);
        }}
      />
    </ItemWrapper>
  );
}

class PrimaryColumnsControl extends BaseControl<ControlProps> {
  render() {
    const columns = this.props.propertyValue || [];
    return (
      <TabsWrapper>
        <DroppableComponent
          items={columns}
          renderComponent={ColumnControlComponent}
          updateOption={this.updateOption}
          updateItems={this.updateItems}
          deleteOption={this.deleteOption}
          onEdit={this.onEdit}
        />
      </TabsWrapper>
    );
  }

  onEdit = (index: number) => {
    const columns = this.props.propertyValue || [];
    const column: ColumnProperties = columns[index];
    this.props.childrenProperties &&
      this.props.openNextPanel({
        parentPropertyName: this.props.parentPropertyName || "",
        parentPropertyValue: this.props.parentPropertyValue,
        propertySections: this.props.childrenProperties,
        ...column,
      });
  };

  updateItems = (items: object[]) => {
    this.updateProperty(this.props.propertyName, items);
  };

  deleteOption = (index: number) => {
    const derivedColumns: ColumnProperties[] = this.props.propertyValue || [];
    const updatedDerivedColumns: ColumnProperties[] = [...derivedColumns];
    updatedDerivedColumns[index].isVisible = !updatedDerivedColumns[index]
      .isVisible;
    this.updateProperty(this.props.propertyName, updatedDerivedColumns);
  };

  updateOption = (index: number, updatedLabel: string) => {
    const derivedColumns: ColumnProperties[] = this.props.propertyValue || [];
    const updatedDerivedColumns: ColumnProperties[] = [...derivedColumns];
    updatedDerivedColumns[index].label = updatedLabel;
    this.updateProperty(this.props.propertyName, updatedDerivedColumns);
  };

  static getControlType() {
    return "PRIMARY_COLUMNS";
  }
}

export default PrimaryColumnsControl;
