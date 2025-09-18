// © 2025 Raül Torres. Este código está licenciado bajo AGPL v3.
export interface Point {
  x: number;
  y: number;
}

export interface ImageResult {
  file: File;
  dataUrl: string;
}

export interface Prompt {
  id: string;
  text: string;
  position: Point;
}
