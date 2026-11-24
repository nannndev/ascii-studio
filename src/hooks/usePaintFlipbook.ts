import { useCallback, useRef } from 'react';
import { DEFAULT_PAINT_COLS, DEFAULT_PAINT_ROWS } from '../constants/studio';
import {
  cloneGrid,
  createBlankPaintGrid,
  paintBox,
  paintFloodFill,
  paintLine,
  paintStamp,
} from '../lib/paintEngine';
import { hexToRgb } from '../lib/color';
import type { AsciiGrid, PaintTool } from '../types/studio';

export interface PaintRuntimeRef {
  cols: number;
  rows: number;
  grid: AsciiGrid;
  frames: AsciiGrid[];
  frameIdx: number;
  previewGrid: AsciiGrid | null;
  drawing: boolean;
  startPos: { col: number; row: number } | null;
  undoStack: AsciiGrid[];
  redoStack: AsciiGrid[];
}

export function usePaintFlipbook(
  initialTintHex: string,
  onSyncFrameState: (frameIdx: number, frameCount: number, playing?: boolean) => void,
  onRender: () => void,
  showToast: (msg: string) => void
) {
  const initialGrid = createBlankPaintGrid(
    DEFAULT_PAINT_COLS,
    DEFAULT_PAINT_ROWS,
    initialTintHex
  );

  const paintRef = useRef<PaintRuntimeRef>({
    cols: DEFAULT_PAINT_COLS,
    rows: DEFAULT_PAINT_ROWS,
    grid: initialGrid,
    frames: [initialGrid],
    frameIdx: 0,
    previewGrid: null,
    drawing: false,
    startPos: null,
    undoStack: [],
    redoStack: [],
  });

  const pushUndo = useCallback(() => {
    const p = paintRef.current;
    p.undoStack.push(cloneGrid(p.grid));
    if (p.undoStack.length > 30) p.undoStack.shift();
    p.redoStack = [];
  }, []);

  const selectFrame = useCallback(
    (idx: number, stopPlaying = false) => {
      const p = paintRef.current;
      if (!p.frames.length) return;
      p.frameIdx = (idx + p.frames.length) % p.frames.length;
      p.grid = p.frames[p.frameIdx];
      p.rows = p.grid.length;
      p.cols = p.grid[0]?.length ?? DEFAULT_PAINT_COLS;
      onSyncFrameState(p.frameIdx, p.frames.length, stopPlaying ? false : undefined);
      onRender();
    },
    [onRender, onSyncFrameState]
  );

  const undo = useCallback(() => {
    const p = paintRef.current;
    const prev = p.undoStack.pop();
    if (!prev) return;
    p.redoStack.push(cloneGrid(p.grid));
    p.grid = prev;
    p.frames[p.frameIdx] = p.grid;
    onRender();
  }, [onRender]);

  const redo = useCallback(() => {
    const p = paintRef.current;
    const next = p.redoStack.pop();
    if (!next) return;
    p.undoStack.push(cloneGrid(p.grid));
    p.grid = next;
    p.frames[p.frameIdx] = p.grid;
    onRender();
  }, [onRender]);

  const clearCurrentFrame = useCallback(
    (tintHex: string) => {
      const p = paintRef.current;
      pushUndo();
      p.grid = createBlankPaintGrid(p.cols, p.rows, tintHex);
      p.frames[p.frameIdx] = p.grid;
      onRender();
    },
    [onRender, pushUndo]
  );

  const importGrid = useCallback(
    (sourceGrid: AsciiGrid) => {
      if (!sourceGrid.length) return;
      const p = paintRef.current;
      pushUndo();
      p.grid = cloneGrid(sourceGrid);
      p.frames[p.frameIdx] = p.grid;
      p.rows = p.grid.length;
      p.cols = p.grid[0].length;
      onRender();
      showToast('Imported ASCII into current Paint frame');
    },
    [onRender, pushUndo, showToast]
  );

  const addBlankFrame = useCallback(
    (tintHex: string) => {
      const p = paintRef.current;
      const blank = createBlankPaintGrid(p.cols, p.rows, tintHex);
      p.frames.splice(p.frameIdx + 1, 0, blank);
      selectFrame(p.frameIdx + 1, true);
      showToast(`Added Frame ${p.frameIdx + 1}`);
    },
    [selectFrame, showToast]
  );

  const duplicateFrame = useCallback(() => {
    const p = paintRef.current;
    const copy = cloneGrid(p.grid);
    p.frames.splice(p.frameIdx + 1, 0, copy);
    selectFrame(p.frameIdx + 1, true);
    showToast(`Duplicated to Frame ${p.frameIdx + 1}`);
  }, [selectFrame, showToast]);

  const deleteFrame = useCallback(() => {
    const p = paintRef.current;
    if (p.frames.length <= 1) {
      showToast('Cannot delete the only frame');
      return;
    }
    p.frames.splice(p.frameIdx, 1);
    selectFrame(Math.max(0, p.frameIdx - 1), true);
    showToast('Deleted frame');
  }, [selectFrame, showToast]);

  const handlePaintPointerDown = useCallback(
    (
      pos: { col: number; row: number },
      tool: PaintTool,
      paintChar: string,
      paintColor: string,
      paintSize: number
    ) => {
      const p = paintRef.current;
      pushUndo();
      p.drawing = true;
      p.startPos = pos;
      const rgb = hexToRgb(paintColor);
      const ch = tool === 'eraser' ? ' ' : paintChar;

      if (tool === 'fill') {
        paintFloodFill(p.grid, pos.col, pos.row, ch, rgb);
        p.drawing = false;
        onRender();
      } else if (tool === 'brush' || tool === 'eraser') {
        paintStamp(p.grid, pos.col, pos.row, ch, rgb, paintSize);
        onRender();
      }
    },
    [onRender, pushUndo]
  );

  const handlePaintPointerMove = useCallback(
    (
      pos: { col: number; row: number },
      tool: PaintTool,
      paintChar: string,
      paintColor: string,
      paintSize: number
    ) => {
      const p = paintRef.current;
      if (!p.drawing) return;
      const rgb = hexToRgb(paintColor);
      const ch = tool === 'eraser' ? ' ' : paintChar;

      if (tool === 'brush' || tool === 'eraser') {
        paintStamp(p.grid, pos.col, pos.row, ch, rgb, paintSize);
        onRender();
      } else if ((tool === 'line' || tool === 'box') && p.startPos) {
        const preview = cloneGrid(p.grid);
        if (tool === 'line') {
          paintLine(
            preview,
            p.startPos.col,
            p.startPos.row,
            pos.col,
            pos.row,
            ch,
            rgb,
            paintSize
          );
        } else {
          paintBox(
            preview,
            p.startPos.col,
            p.startPos.row,
            pos.col,
            pos.row,
            ch,
            rgb
          );
        }
        p.previewGrid = preview;
        onRender();
      }
    },
    [onRender]
  );

  const handlePaintPointerUp = useCallback(() => {
    const p = paintRef.current;
    if (p.drawing && p.previewGrid) {
      p.grid = p.previewGrid;
      p.frames[p.frameIdx] = p.grid;
      p.previewGrid = null;
      onRender();
    }
    p.drawing = false;
  }, [onRender]);

  return {
    paintRef,
    selectFrame,
    undo,
    redo,
    clearCurrentFrame,
    importGrid,
    addBlankFrame,
    duplicateFrame,
    deleteFrame,
    handlePaintPointerDown,
    handlePaintPointerMove,
    handlePaintPointerUp,
  };
}
