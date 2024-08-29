import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const root = style({
  width: '100%',
  minHeight: 44,
  padding: '0 6px',
  paddingTop: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  position: 'sticky',
  top: 0,
  zIndex: 1,
  backgroundColor: cssVarV2('layer/background/secondary'),
});
export const content = style({
  selectors: {
    '&.center': {
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'fit-content',
      maxWidth: 'calc(100% - 12px - 88px - 16px)',
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    },
    '&:not(.center)': {
      width: 0,
      flex: 1,
    },
  },
});
export const spacer = style({
  width: 0,
  flex: 1,
});
export const prefix = style({
  display: 'flex',
  alignItems: 'center',
  gap: 0,
});
export const suffix = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
});
