/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React from 'react';
import { CommonProps, getWindow, useTheme } from '../utils';
import '@itwin/itwinui-css/css/tree.css';
import { SvgChevronRight } from '@itwin/itwinui-icons-react';
import { IconButton } from '../Buttons/IconButton';
import cx from 'classnames';
import { TreeContext } from './Tree';

export type TreeNodeProps = {
  /**
   * The main text displayed on the node.
   */
  label: React.ReactNode;
  /**
   * Small note displayed below main label.
   */
  sublabel?: React.ReactNode;
  /**
   * Icon shown before title and caption content.
   */
  icon?: JSX.Element;
  /**
   * Is TreeNode disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Sub-nodes, shown and hidden by expanding TreeNode.
   * Recommended to use TreeNode components.
   */
  children?: React.ReactNode;
} & CommonProps;

/**
 * Describe me here!
 * @example
 * Example usages go here!
 */
export const TreeNode = (props: TreeNodeProps) => {
  const {
    label,
    sublabel,
    children,
    style,
    className,
    icon,
    isDisabled = false,
    ...rest
  } = props;
  useTheme();

  const context = React.useContext(TreeContext);
  const currentDepth = context?.nodeDepth ?? 0;

  const styleLevel = React.useMemo(
    () =>
      getWindow()?.CSS?.supports?.(`--level: ${currentDepth}`)
        ? { '--level': currentDepth, ...style }
        : { marginLeft: currentDepth ? currentDepth * 28 : 0, ...style },
    [currentDepth, style],
  );

  const [expanded, setExpanded] = React.useState(false);
  const [isChecked, setIsChecked] = React.useState(
    React.isValidElement(context?.checkbox)
      ? context?.checkbox.props['checked']
      : false,
  );
  const isSelected = React.useMemo(() => {
    return context?.selectedNode === label;
  }, [context?.selectedNode, label]);

  return (
    <li role='treeitem' aria-expanded={expanded} {...rest}>
      <div
        className={cx('iui-tree-node', {
          'iui-active': isSelected,
          'iui-disabled': isDisabled,
          className,
        })}
        style={styleLevel}
        onClick={(e) => {
          if (e.currentTarget != e.target) {
            return;
          }
          if (isSelected) {
            context?.setSelectedNode?.('');
          } else if (!isDisabled) {
            context?.setSelectedNode?.(label);
            context?.onNodeSelected?.();
          }
        }}
      >
        {context?.checkbox && React.isValidElement(context?.checkbox)
          ? React.cloneElement(context?.checkbox, {
              className: 'iui-tree-node-checkbox',
              disabled: isDisabled,
              checked: isChecked,
              onClick: () => {
                setIsChecked(!isChecked);
                context.onNodeCheckboxSelected?.();
              },
            })
          : context?.checkbox}
        <div className='iui-tree-node-content'>
          {children && (
            <IconButton
              styleType='borderless'
              size='small'
              onClick={() => {
                setExpanded(!expanded);
                context?.onNodeExpanded?.();
              }}
              disabled={isDisabled}
            >
              <SvgChevronRight
                className={cx('iui-tree-node-content-expander-icon', {
                  'iui-tree-node-content-expander-icon-expanded': expanded,
                })}
              />
            </IconButton>
          )}
          {icon &&
            React.cloneElement(icon, {
              className: cx('iui-tree-node-content-icon', icon.props.className),
            })}
          <span className='iui-tree-node-content-label'>
            <div className='iui-tree-node-content-title'>{label}</div>
            <div className='iui-tree-node-content-caption'>{sublabel}</div>
          </span>
        </div>
      </div>
      {children && expanded && (
        <ul className='iui-sub-tree' role='group'>
          <TreeContext.Provider
            value={{
              selectedNode: context?.selectedNode,
              setSelectedNode: context?.setSelectedNode,
              onNodeSelected: context?.onNodeSelected,
              onNodeExpanded: context?.onNodeExpanded,
              checkbox: context?.checkbox,
              onNodeCheckboxSelected: context?.onNodeCheckboxSelected,
              nodeDepth: currentDepth + 1,
            }}
          >
            {React.Children.map(children, (node) => node)}
          </TreeContext.Provider>
        </ul>
      )}
    </li>
  );
};

export default TreeNode;
