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
import { TreeContext, NodeData } from './Tree';

export type TreeNodeProps<T> = {
  /**
   * Unique id of the node.
   */
  nodeId: string;
  /**
   * The main text displayed on the node.
   */
  label: React.ReactNode;
  /**
   * Small note displayed below main label.
   */
  sublabel?: React.ReactNode;
  /**
   * Icon shown before label and sublabel content.
   */
  icon?: JSX.Element;
  /**
   * Is TreeNode disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Is TreeNode expanded.
   * @default false
   */
  isExpanded?: boolean;
  /**
   * Callback fired when expanding or closing a TreeNode.
   */
  onNodeExpanded?: (nodeId: string, expanded: boolean) => void;
  /**
   * Callback fired when selecting a TreeNode.
   */
  onNodeSelected?: (nodeId: string, selected: boolean) => void;
  /**
   * The TreeNode's child nodes.
   * If undefined or empty, expander button is not shown.
   */
  subNodes?: Array<NodeData<T>>;
  /**
   * Checkbox to be shown before TreeNode.
   * If undefined checkbox will not be shown.
   * Recommended to use Checkbox component.
   */
  nodeCheckbox?: React.ReactNode;
  /**
   * Content shown after TreeNode.
   */
  children?: React.ReactNode;
  depth?: number;
} & CommonProps;

/**
 * @example
  <TreeNode
    nodeId={nodeId}
    label={label}
    sublabel={subLabel}
    subNodes={subnodes}
    onNodeExpanded={onNodeExpanded}
    onNodeSelected={onSelectedNodeChange}
    isDisabled={isDisabled}
    isExpanded={isExpanded}
    nodeCheckbox={<Checkbox variant='eyeball'/>}
    icon={<SvgPlaceholder />}
  />
 */
export const TreeNode = <T,>(props: TreeNodeProps<T>) => {
  const {
    nodeId,
    label,
    sublabel,
    children,
    style,
    className,
    icon,
    isDisabled = false,
    isExpanded = false,
    onNodeSelected,
    onNodeExpanded,
    subNodes,
    nodeCheckbox,
    depth = 0,
    ...rest
  } = props;
  useTheme();

  const context = React.useContext(TreeContext);
  const nodeDepth = depth;

  const subNodeIds = React.useMemo(() => {
    const nodes = Array<string>();
    subNodes?.forEach((subNode) => {
      if (subNode.nodeId) {
        nodes.push(subNode?.nodeId);
      }
    });
    return nodes;
  }, [subNodes]);

  const styleLevel = React.useMemo(
    () =>
      getWindow()?.CSS?.supports?.(`--level: ${nodeDepth}`)
        ? { '--level': nodeDepth, ...style }
        : { marginLeft: nodeDepth ? nodeDepth * 28 : 0, ...style },
    [nodeDepth, style],
  );

  const selectedNodes = React.useMemo(() => {
    return context?.selectedNodes ?? [];
  }, [context?.selectedNodes]);

  const isSelected = React.useMemo(() => {
    return selectedNodes.findIndex((id) => id === nodeId) != -1;
  }, [selectedNodes, nodeId]);

  const onNodeClick = () => {
    if (isDisabled) {
      return;
    }
    if (isSelected) {
      context?.setSelectedNode?.(
        selectedNodes.filter((item) => item != nodeId),
      );
    } else {
      context?.setSelectedNode?.([nodeId]);
    }
    onNodeSelected?.(nodeId, !isSelected);
  };

  return (
    <>
      <li role='treeitem' id={nodeId} aria-expanded={isExpanded} {...rest}>
        {
          <div
            className={cx(
              'iui-tree-node',
              {
                'iui-active': isSelected,
                'iui-disabled': isDisabled,
              },
              className,
            )}
            style={styleLevel}
            onClick={() => onNodeClick()}
            tabIndex={isSelected ? 0 : -1}
          >
            {nodeCheckbox && React.isValidElement(nodeCheckbox)
              ? React.cloneElement(nodeCheckbox, {
                  className: cx(
                    'iui-tree-node-checkbox',
                    nodeCheckbox.props.className,
                  ),
                })
              : nodeCheckbox}
            <div className='iui-tree-node-content'>
              {subNodes && subNodes.length > 0 && (
                <IconButton
                  styleType='borderless'
                  size='small'
                  onClick={(e) => {
                    onNodeExpanded?.(nodeId, !isExpanded);
                    e.stopPropagation();
                  }}
                  disabled={isDisabled}
                  tabIndex={-1}
                >
                  <SvgChevronRight
                    className={cx('iui-tree-node-content-expander-icon', {
                      'iui-tree-node-content-expander-icon-expanded': isExpanded,
                    })}
                  />
                </IconButton>
              )}
              {icon &&
                React.cloneElement(icon, {
                  className: cx(
                    'iui-tree-node-content-icon',
                    icon.props.className,
                  ),
                })}
              <span className='iui-tree-node-content-label'>
                <div className='iui-tree-node-content-title'>{label}</div>
                <div className='iui-tree-node-content-caption'>{sublabel}</div>
              </span>
              {children}
            </div>
          </div>
        }
        {subNodes && subNodes.length > 0 && (
          <ul
            className='iui-sub-tree'
            role='group'
            aria-owns={subNodeIds.join(', ')}
          />
        )}
      </li>
    </>
  );
};

export default TreeNode;
