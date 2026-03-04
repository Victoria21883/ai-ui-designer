// src/types/index.ts

// ============================================
// Базовые типы для CSS свойств
// ============================================

export type CSSProperties = Partial<{
  // Размеры и отступы
  width: string | number;
  height: string | number;
  minWidth: string | number;
  maxWidth: string | number;
  minHeight: string | number;
  maxHeight: string | number;
  margin: string | number;
  marginTop: string | number;
  marginRight: string | number;
  marginBottom: string | number;
  marginLeft: string | number;
  padding: string | number;
  paddingTop: string | number;
  paddingRight: string | number;
  paddingBottom: string | number;
  paddingLeft: string | number;

  // Цвета
  color: string;
  backgroundColor: string;
  borderColor: string;

  // Текст
  fontSize: string | number;
  fontWeight: string | number;
  lineHeight: string | number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textDecoration: 'none' | 'underline' | 'line-through';
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  fontFamily: string;
  fontStyle: 'normal' | 'italic';

  // Границы
  border: string;
  borderWidth: string | number;
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  borderRadius: string | number;
  borderTopLeftRadius: string | number;
  borderTopRightRadius: string | number;
  borderBottomLeftRadius: string | number;
  borderBottomRightRadius: string | number;

  // Flexbox
  display: 'block' | 'inline' | 'flex' | 'grid' | 'none';
  flexDirection: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flex: string | number;
  flexGrow: number;
  flexShrink: number;
  flexBasis: string | number;
  gap: string | number;
  rowGap: string | number;
  columnGap: string | number;

  // Grid
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gridColumn: string;
  gridRow: string;

  // Позиционирование
  position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top: string | number;
  right: string | number;
  bottom: string | number;
  left: string | number;
  zIndex: number;

  // Тени
  boxShadow: string;
  textShadow: string;

  // Эффекты
  opacity: number;
  transform: string;
  transition: string;
  cursor: 'default' | 'pointer' | 'text' | 'move' | 'not-allowed' | 'wait' | 'help';

  // Переполнение
  overflow: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowX: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY: 'visible' | 'hidden' | 'scroll' | 'auto';
}>;

// ============================================
// Типы пропсов для каждого компонента
// ============================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps {
  text: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  type?: InputType;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  hint?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

export type CardElevation = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  elevation?: CardElevation;
  bordered?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline';
export type TextColor =
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'error'
  | 'success'
  | 'warning'
  | 'info';

export interface TextProps {
  content: string;
  variant?: TextVariant;
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: TextColor | string;
  weight?: 'light' | 'normal' | 'medium' | 'bold' | number;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  nowrap?: boolean;
}

export type ContainerDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';
export type ContainerJustify = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
export type ContainerAlign = 'start' | 'end' | 'center' | 'stretch' | 'baseline';
export type ContainerGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ContainerProps {
  children?: React.ReactNode;
  direction?: ContainerDirection;
  justify?: ContainerJustify;
  align?: ContainerAlign;
  gap?: ContainerGap;
  padding?: ContainerGap;
  wrap?: boolean;
  fluid?: boolean;
  maxWidth?: string | number;
}

export interface ImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  borderRadius?: string | number;
  lazy?: boolean;
  onClick?: () => void;
}

// ============================================
// Объединенный тип для всех пропсов
// ============================================

export type ComponentPropsMap = {
  button: ButtonProps;
  input: InputProps;
  card: CardProps;
  text: TextProps;
  container: ContainerProps;
  image: ImageProps;
};

export type ComponentType = keyof ComponentPropsMap;

// ============================================
// Основной тип UI компонента (без any!)
// ============================================

export interface UIComponent<T extends ComponentType = ComponentType> {
  id: string;
  type: T;
  props: ComponentPropsMap[T];
  children?: UIComponent[];
  styles?: CSSProperties;
}

// ============================================
// Типы для темы
// ============================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  [key: string]: string | Record<string, string>;
}

export interface ThemeSpacing {
  xs: string | number;
  sm: string | number;
  md: string | number;
  lg: string | number;
  xl: string | number;
  [key: string]: string | number;
}

export interface ThemeBorderRadius {
  none: string | number;
  sm: string | number;
  md: string | number;
  lg: string | number;
  full: string | number;
  [key: string]: string | number;
}

export interface ThemeTypography {
  fontFamily?: string;
  fontSize?: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    [key: string]: string;
  };
  fontWeight?: {
    light: number;
    normal: number;
    medium: number;
    bold: number;
    [key: string]: number;
  };
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  typography?: ThemeTypography;
}

// ============================================
// Типы для проекта
// ============================================

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  components: UIComponent[];
  theme: Theme;
  thumbnail?: string;
  tags?: string[];
}

// ============================================
// Типы для истории версий
// ============================================

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  snapshot: Project;
  description: string;
  author?: string;
}

// ============================================
// Типы для состояния редактора
// ============================================

export interface EditorState {
  project: Project;
  selectedComponentId: string | null;
  history: HistoryEntry[];
  historyIndex: number;
  isModified: boolean;
}

// ============================================
// Типы для действий редактора
// ============================================

export type EditorAction =
  | { type: 'ADD_COMPONENT'; component: UIComponent }
  | { type: 'UPDATE_COMPONENT'; id: string; updates: Partial<UIComponent> }
  | { type: 'DELETE_COMPONENT'; id: string }
  | { type: 'SELECT_COMPONENT'; id: string | null }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'SAVE_HISTORY'; description: string }
  | { type: 'UPDATE_THEME'; theme: Partial<Theme> }
  | { type: 'SET_PROJECT'; project: Project };

// ============================================
// Вспомогательные типы
// ============================================

export type ComponentWithoutId = Omit<UIComponent, 'id'>;

export type ProjectSummary = Pick<Project, 'id' | 'name' | 'createdAt' | 'updatedAt' | 'thumbnail'>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
