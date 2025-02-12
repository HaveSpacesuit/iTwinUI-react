/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import cx from 'classnames';
import React from 'react';
import { Menu, MenuProps } from '../Menu';
import { Surface } from '../Surface';
import {
  useSafeContext,
  useMergedRefs,
  useVirtualization,
  mergeRefs,
  getWindow,
} from '../utils';
import { ComboBoxStateContext, ComboBoxRefsContext } from './helpers';

type ComboBoxMenuProps = Omit<MenuProps, 'onClick'> &
  React.ComponentPropsWithoutRef<'ul'>;

const VirtualizedComboBoxMenu = React.forwardRef(
  (
    { children, style, ...rest }: ComboBoxMenuProps,
    forwardedRef: React.Ref<HTMLUListElement>,
  ) => {
    const {
      minWidth,
      id,
      filteredOptions,
      getMenuItem,
      focusedIndex,
    } = useSafeContext(ComboBoxStateContext);
    const { menuRef } = useSafeContext(ComboBoxRefsContext);

    const virtualItemRenderer = React.useCallback(
      (index: number) =>
        filteredOptions.length > 0
          ? getMenuItem(filteredOptions[index])
          : (children as JSX.Element), // Here is expected empty state content
      [filteredOptions, getMenuItem, children],
    );

    const { outerProps, innerProps, visibleChildren } = useVirtualization({
      // 'Fool' VirtualScroll by passing length 1
      // whenever there is no elements, to show empty state message
      itemsLength: filteredOptions.length || 1,
      itemRenderer: virtualItemRenderer,
      scrollToIndex: focusedIndex,
    });

    const overflowY = getWindow()?.CSS?.supports?.('overflow-x: overlay')
      ? { overflowY: 'overlay' }
      : { overflowY: 'auto' };

    const styles = React.useMemo(
      () => ({
        minWidth,
        maxWidth: `min(${minWidth * 2}px, 90vw)`,
        maxHeight: 315,
      }),
      [minWidth],
    );

    return (
      <Surface
        elevation={1}
        style={{ ...styles, ...(overflowY as React.CSSProperties), ...style }}
        {...rest}
      >
        <div {...outerProps}>
          <Menu
            id={`${id}-list`}
            setFocus={false}
            role='listbox'
            ref={mergeRefs(menuRef, innerProps.ref, forwardedRef)}
            style={innerProps.style}
          >
            {visibleChildren}
          </Menu>
        </div>
      </Surface>
    );
  },
);

export const ComboBoxMenu = React.forwardRef(
  (props: ComboBoxMenuProps, forwardedRef: React.Ref<HTMLUListElement>) => {
    const { className, style, ...rest } = props;
    const { minWidth, id, enableVirtualization } = useSafeContext(
      ComboBoxStateContext,
    );
    const { menuRef } = useSafeContext(ComboBoxRefsContext);

    const refs = useMergedRefs(menuRef, forwardedRef);

    const styles = React.useMemo(
      () => ({
        minWidth,
        maxWidth: `min(${minWidth * 2}px, 90vw)`,
        maxHeight: 315,
      }),
      [minWidth],
    );

    return (
      <>
        {!enableVirtualization ? (
          <Menu
            id={`${id}-list`}
            style={{ ...styles, ...style }}
            setFocus={false}
            role='listbox'
            ref={refs}
            className={cx('iui-scroll', className)}
            {...rest}
          />
        ) : (
          <VirtualizedComboBoxMenu ref={forwardedRef} {...props} />
        )}
      </>
    );
  },
);
ComboBoxMenu.displayName = 'ComboBoxMenu';
