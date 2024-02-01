import { cssVar } from '@toeverything/theme';
import { style } from '@vanilla-extract/css';
export const menuItemStyle = style({
  fontSize: cssVar('fontXs'),
});
export const variableSelectTitleStyle = style({
  margin: '7px 16px',
  fontWeight: 500,
  lineHeight: '20px',
  fontSize: cssVar('fontXs'),
  color: cssVar('textSecondaryColor'),
});
export const variableSelectDividerStyle = style({
  marginTop: '2px',
  marginBottom: '2px',
  marginLeft: '12px',
  marginRight: '8px',
  height: '1px',
  background: cssVar('borderColor'),
});
export const menuItemTextStyle = style({
  fontSize: cssVar('fontXs'),
});
export const filterItemStyle = style({
  display: 'flex',
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '8px',
  background: cssVar('white'),
  padding: '4px 8px',
  overflow: 'hidden',
});
export const filterItemCloseStyle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  marginLeft: '4px',
});
export const inputStyle = style({
  fontSize: cssVar('fontXs'),
  padding: '2px 4px',
  transition: 'all 0.15s ease-in-out',
  ':hover': {
    cursor: 'pointer',
    background: cssVar('hoverColor'),
    borderRadius: '4px',
  },
});
export const switchStyle = style({
  fontSize: cssVar('fontXs'),
  color: cssVar('textSecondaryColor'),
  padding: '2px 4px',
  transition: 'all 0.15s ease-in-out',
  display: 'flex',
  alignItems: 'center',
  ':hover': {
    cursor: 'pointer',
    background: cssVar('hoverColor'),
    borderRadius: '4px',
  },
  whiteSpace: 'nowrap',
});
export const filterTypeStyle = style({
  fontSize: cssVar('fontSm'),
  display: 'flex',
  alignItems: 'center',
  padding: '2px 4px',
  transition: 'all 0.15s ease-in-out',
  marginRight: '6px',
  ':hover': {
    cursor: 'pointer',
    background: cssVar('hoverColor'),
    borderRadius: '4px',
  },
});
export const filterTypeIconStyle = style({
  fontSize: cssVar('fontBase'),
  marginRight: '6px',
  padding: '1px 0',
  display: 'flex',
  alignItems: 'center',
  color: cssVar('iconColor'),
});
