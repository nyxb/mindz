import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';
export const root = style({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexFlow: 'column',
  background: cssVar('backgroundPrimaryColor'),
});
export const scrollContainer = style({
  flex: 1,
  width: '100%',
  paddingBottom: '32px',
});
export const headerCreateNewButton = style({
  transition: 'opacity 0.1s ease-in-out',
});
export const headerCreateNewCollectionIconButton = style({
  padding: '4px 8px',
  fontSize: '16px',
  width: '32px',
  height: '28px',
  borderRadius: '8px',
});
export const headerCreateNewButtonHidden = style({
  opacity: 0,
  pointerEvents: 'none',
});
export const headerRightWindows = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  selectors: {
    '&[data-is-windows-desktop="true"]': {
      transform: 'translateX(16px)',
    },
  },
});
