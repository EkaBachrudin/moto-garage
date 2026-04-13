/// <reference types="vite/client" />

declare module '*.css' {
  const content: { className: string }
  export default content
}

declare module '*.module.css' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.scss' {
  const content: { className: string }
  export default content
}

declare module '*.module.scss' {
  const classes: { [key: string]: string }
  export default classes
}

declare module '*.svg' {
  const content: React.FC<React.SVGAttributes<SVGElement>>
  export default content
}

declare module '*.png' {
  const content: string
  export default content
}

declare module '*.jpg' {
  const content: string
  export default content
}

declare module '*.jpeg' {
  const content: string
  export default content
}

declare module '*.gif' {
  const content: string
  export default content
}

declare module '*.webp' {
  const content: string
  export default content
}

declare module '*.ico' {
  const content: string
  export default content
}

declare module '*.bmp' {
  const content: string
  export default content
}
