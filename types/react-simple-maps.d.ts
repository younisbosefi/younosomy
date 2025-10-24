declare module 'react-simple-maps' {
  import { ReactNode } from 'react'
  
  export interface ComposableMapProps {
    projection?: string
    projectionConfig?: any
    width?: number
    height?: number
    children?: ReactNode
    className?: string
    style?: React.CSSProperties
  }
  
  export interface GeographiesProps {
    geography: any
    children: (params: { geographies: any[] }) => ReactNode
  }
  
  export interface GeographyProps {
    geography: any
    fill?: string
    stroke?: string
    strokeWidth?: number
    onMouseEnter?: (event: any) => void
    onMouseLeave?: (event: any) => void
    onClick?: (event: any) => void
    style?: any
    className?: string
  }
  
  export interface ZoomableGroupProps {
    center?: [number, number]
    zoom?: number
    minZoom?: number
    maxZoom?: number
    children?: ReactNode
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void
  }
  
  export const ComposableMap: React.FC<ComposableMapProps>
  export const Geographies: React.FC<GeographiesProps>
  export const Geography: React.FC<GeographyProps>
  export const ZoomableGroup: React.FC<ZoomableGroupProps>
}
