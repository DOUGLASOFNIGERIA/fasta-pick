import { useWindowDimensions } from 'react-native';

export const BREAKPOINTS = {
  compact: 0,
  medium: 600,
  expanded: 840,
};

export const MAX_CONTENT_WIDTH = {
  compact: null,
  medium: 720,
  expanded: 1120,
};

export const GRID_COLUMNS = {
  compact: 2,
  medium: 3,
  expanded: 4,
};

export const GUTTER = {
  compact: 16,
  medium: 24,
  expanded: 32,
};

export const getFormFactor = (width) => {
  if (width >= BREAKPOINTS.expanded) return 'expanded';
  if (width >= BREAKPOINTS.medium) return 'medium';
  return 'compact';
};

export const useFormFactor = () => {
  const { width, height } = useWindowDimensions();
  const formFactor = getFormFactor(width);
  const isCompact = formFactor === 'compact';
  const isMedium = formFactor === 'medium';
  const isExpanded = formFactor === 'expanded';
  const isTablet = !isCompact;
  const isLandscape = width > height;

  const gutter = GUTTER[formFactor];
  const maxWidth = MAX_CONTENT_WIDTH[formFactor];
  const contentWidth = maxWidth ? Math.min(width, maxWidth) : width;
  const innerWidth = contentWidth - gutter * 2;
  const gridGap = 12;
  const columns = GRID_COLUMNS[formFactor];
  const gridCardWidth = Math.max(
    0,
    Math.floor((innerWidth - gridGap * (columns - 1)) / columns)
  );
  const popularCardWidth = isCompact ? 148 : isMedium ? 176 : 200;

  return {
    width,
    height,
    formFactor,
    isCompact,
    isMedium,
    isExpanded,
    isTablet,
    isLandscape,
    gutter,
    contentWidth,
    innerWidth,
    columns,
    gridGap,
    gridCardWidth,
    popularCardWidth,
    containerStyle: {
      width: '100%',
      maxWidth: contentWidth,
      alignSelf: 'center',
    },
    scrollContentStyle: {
      width: '100%',
      maxWidth: contentWidth,
      alignSelf: 'center',
      paddingHorizontal: gutter,
    },
  };
};

export const breakpointValue = (width, values) => {
  const formFactor = getFormFactor(width);
  if (values[formFactor] !== undefined) return values[formFactor];
  if (values.compact !== undefined) return values.compact;
  return Object.values(values)[0];
};
